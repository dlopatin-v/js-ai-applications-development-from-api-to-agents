# Python Code Sandbox (python-code-interpreter MCP Server)

A stateful Python execution environment built on the Model Context Protocol (MCP). The JS agent connects to a long-lived `khshanovskyi/python-code-interpreter-mcp-server` container over **Streamable HTTP** and runs Python code inside isolated, per-session sandboxes — all managed transparently through the `execute_code` tool.

## Features

- **Stateful Execution**: Variables and state persist across multiple code executions within the same sandbox session
- **Isolated Sessions**: Each conversation gets its own sandbox session (started on first call, reused for follow-up calls)
- **Standard Library + Common Packages**: Python 3 with standard scientific stack available in the sandbox
- **Streamable HTTP Transport**: Single long-lived server you start with `docker compose up`, no per-request container spin-up
- **Automatic Cleanup**: Sessions are reclaimed when the agent disconnects or the session is no longer used

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
│  PyCodeInterpreterTool   │
│  (wraps MCP execute_code)│
└────────┬─────────────────┘
         │
         │ MCP Protocol (Streamable HTTP)
         │ http://localhost:8050/mcp
         │
┌────────▼──────────────────────────────────────────┐
│  khshanovskyi/python-code-interpreter-mcp-server  │
│  (Docker service started via docker-compose)      │
└────────┬──────────────────────────────────────────┘
         │
         │ in-process Python sessions
         │
┌────────▼────────┐
│  Python         │
│  Sandboxes      │
│  (per session)  │
└─────────────────┘
```

The agent calls `execute_code`. `PyCodeInterpreterTool` forwards that call straight to the MCP server's `execute_code` tool via Streamable HTTP. The MCP server is a single long-running container started by `docker compose up` — no per-request `docker run` is performed.

---

## Usage

The tool is exposed to the agent as `execute_code`. Its parameter schema is discovered dynamically from the MCP server, plus a `script_path` field that the JS wrapper injects:

| Parameter | Type | Description |
|---|---|---|
| `code` | `string` | Python code to run |
| `session_id` | `string` | Sandbox session ID. Empty string on first call; reuse on subsequent calls |
| `script_path` | `string` (optional) | Path to a skill script relative to the skills root. Its content is prepended to `code` |

### First call — initialize sandbox and run code

Pass `session_id = ""`. The tool will:
1. Read the script referenced by `script_path` (if provided) and prepend it to `code`
2. Call `execute_code` on the MCP server with `session_id = ""` — the server allocates a fresh sandbox session
3. Return the result including `session_info.session_id` — **save this for reuse**

```json
{
  "code": "result, category = convert_units(100, 'km', 'miles')\nprint(f'Category: {category}')\nprint(f'Input:    {fmt(100)} km')\nprint(f'Result:   {fmt(result)} miles')",
  "session_id": "",
  "script_path": "unit-converter/scripts/convert.py"
}
```

**Response:**
```json
{
  "success": true,
  "output": ["Category: length\nInput:    100 km\nResult:   62.1371 miles\n"],
  "traceback": [],
  "files": [],
  "session_info": {
    "session_id": "abc123def456"
  }
}
```

### Subsequent calls — reuse the session

Pass the saved `session_id`. The script is already in memory — omit `script_path` and just send the conversion call:

```json
{
  "code": "result, category = convert_units(5, 'kg', 'lbs')\nprint(f'Category: {category}')\nprint(f'Input:    {fmt(5)} kg')\nprint(f'Result:   {fmt(result)} lbs')",
  "session_id": "abc123def456"
}
```

---

## How `script_path` Works

When `script_path` is provided, `PyCodeInterpreterTool` reads the file from the local skills directory and prepends its content to `code`, separated by a blank line:

```
<contents of convert.py>

<your conversion call code>
```

This means the functions defined in `convert.py` (`convert_units`, `fmt`) are available in the same execution context as your call code — without needing to copy the entire script into the request.

---

## Session Lifecycle

1. **Creation**: First call with `session_id = ""` allocates a new sandbox session on the server
2. **Active**: The same `session_id` is reused for every subsequent call in the conversation
3. **End of session**: The session is reclaimed when the agent disconnects or the server is stopped

### Session not found

If a session ID is no longer valid (server restarted, session GC'd), you will see an error in the output:

```json
{
  "success": false,
  "output": [],
  "traceback": ["..."],
  "files": [],
  "error": "Session not found: abc123def456"
}
```

**Solution**: Restart from Step 1 — pass `session_id = ""` to allocate a new sandbox and reload the script.

---

## Prerequisites

Start the MCP server once before running the custom agent:

```bash
cd t12_skills
docker compose up -d
```

This launches `khshanovskyi/python-code-interpreter-mcp-server` and exposes the MCP endpoint at `http://localhost:8050/mcp`.

---

## API Reference

### `execute_code` (agent-facing tool)

Execute Python code in a persistent sandbox session.

**Parameters:**
- `code` (string): Python code to execute (multi-line supported)
- `session_id` (string, optional): Session identifier. Empty or omitted for a new sandbox; reuse the returned ID for subsequent calls
- `script_path` (string, optional): Skill script path relative to the skills root — prepended to `code`

**Returns:**
```json
{
  "success": true,
  "output": ["...stdout..."],
  "result": "...optional final-expression value...",
  "error": "...error message if failed...",
  "traceback": ["...optional traceback frames..."],
  "files": [],
  "session_info": {
    "session_id": "abc123def456"
  }
}
```
