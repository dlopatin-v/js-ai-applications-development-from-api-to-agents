# Node.js Code Sandbox (node-code-sandbox MCP Server)

A stateful JavaScript execution environment built on the Model Context Protocol (MCP). The JS agent launches disposable Docker containers on demand and runs JavaScript code inside them via the `run_js` tool — all managed transparently through the `execute_code` tool wrapper.

## Features

- **Stateful Execution**: Variables and state persist across multiple code executions within the same container session
- **Isolated Containers**: Each conversation gets its own Docker container (started on first call, reused for follow-up calls)
- **npm Dependency Support**: Install packages on demand before running code
- **ESModules**: Code must use ESModules syntax (`import`/`export`)
- **Automatic Cleanup**: Containers are removed (`--rm`) when the agent stops or the session ends

---

## Architecture

```
┌─────────────────┐
│  JS Agent       │
│  (TypeScript)   │
└────────┬────────┘
         │
         │ execute_code tool call
         │
┌────────▼─────────────────┐
│  JsCodeInterpreterTool   │
│  (wraps sandbox tools)   │
└────────┬─────────────────┘
         │
         │ MCP Protocol (STDIO)
         │
┌────────▼────────────────────────┐
│  mcp/node-code-sandbox          │
│  (Docker container, STDIO MCP)  │
└────────┬────────────────────────┘
         │
         │ docker run --rm -i
         │
┌────────▼────────┐
│  Sandbox        │
│  Containers     │
│  (per session)  │
└─────────────────┘
```

The agent calls `execute_code`. `JsCodeInterpreterTool` translates that into two underlying MCP operations: `sandbox_initialize` (first call only) and `run_js` (every call). The MCP server itself is launched via `docker run --rm -i mcp/node-code-sandbox` — no persistent service required.

---

## Usage

The tool is exposed to the agent as `execute_code` with these parameters:

| Parameter | Type | Description |
|---|---|---|
| `code` | `string` | JavaScript code to run (ESModules syntax) |
| `container_id` | `string` | Sandbox container ID. Empty string on first call; reuse on subsequent calls |
| `script_path` | `string` (optional) | Path to a skill script relative to the skills root. Its content is prepended to `code` |

### First call — initialize sandbox and run code

Pass `container_id = ""`. The tool will:
1. Call `sandbox_initialize` to start a fresh Node.js Docker container
2. Call `run_js` with the full code (script content + your call)
3. Return the result including `session_info.container_id` — **save this for reuse**

```json
{
  "code": "const [result, category] = convertUnits(100, 'km', 'miles');\nconsole.log(`Category: ${category}`);\nconsole.log(`Input:    ${fmt(100)} km`);\nconsole.log(`Result:   ${fmt(result)} miles`);",
  "container_id": "",
  "script_path": "unit-converter/scripts/convert.ts"
}
```

**Response:**
```json
{
  "success": true,
  "output": ["Category: length\nInput:    100 km\nResult:   62.1371 miles\n"],
  "session_info": {
    "container_id": "abc123def456"
  }
}
```

### Subsequent calls — reuse the container

Pass the saved `container_id`. The script is already in memory — omit `script_path` and just send the conversion call:

```json
{
  "code": "const [result, category] = convertUnits(5, 'kg', 'lbs');\nconsole.log(`Category: ${category}`);\nconsole.log(`Input:    ${fmt(5)} kg`);\nconsole.log(`Result:   ${fmt(result)} lbs`);",
  "container_id": "abc123def456"
}
```

---

## How `script_path` Works

When `script_path` is provided, `JsCodeInterpreterTool` reads the file from the local skills directory and prepends its content to `code`, separated by a blank line:

```
<contents of convert.ts>

<your conversion call code>
```

This means the functions defined in `convert.ts` (`convertUnits`, `fmt`) are available in the same execution context as your call code — without needing to copy the entire script into the request.

---

## Session Lifecycle

1. **Creation**: First call with `container_id = ""` starts a new Docker container
2. **Active**: The same container is reused for every subsequent call in the conversation
3. **End of session**: The container is stopped and removed when the agent or process exits

### Container not found

If a container ID is no longer valid (container was stopped externally), you will see an error in the output:

```json
{
  "success": false,
  "output": [],
  "error": "Container not found: abc123def456"
}
```

**Solution**: Restart from Step 1 — pass `container_id = ""` to create a new sandbox and reload the script.

---

## Prerequisites

The `mcp/node-code-sandbox` Docker image must be available locally:

```bash
docker pull mcp/node-code-sandbox
```

No `docker compose up` is required — the agent launches containers on demand.

---

## API Reference

### `execute_code` (agent-facing tool)

Execute JavaScript code in a persistent Node.js sandbox container.

**Parameters:**
- `code` (string): JavaScript code to execute (ESModules syntax, multi-line supported)
- `container_id` (string, optional): Container identifier. Empty or omitted for a new sandbox; reuse the returned ID for subsequent calls
- `script_path` (string, optional): Skill script path relative to the skills root — prepended to `code`

**Returns:**
```json
{
  "success": true,
  "output": ["...stdout/stderr..."],
  "error": "...error message if failed...",
  "session_info": {
    "container_id": "abc123def456"
  }
}
```
