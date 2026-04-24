# MCP Python Code Interpreter

A stateful Python code execution environment with Jupyter kernel support, built on the Model Context Protocol (MCP). The JS agent communicates with this MCP server to execute Python scripts — the agent itself is TypeScript, but code execution happens inside the server's Python runtime.

## Features

- **Stateful Execution**: Variables, imports, and state persist across multiple code executions within a session
- **Jupyter Kernel Backend**: Full Jupyter kernel support with IPython features
- **Session Management**: Secure session IDs with automatic 30-minute timeout
- **Visualization Support**: Automatic capture and export of matplotlib, seaborn, and Plotly figures
- **File Generation**: Access generated files (images, data files, plots) via MCP resources
- **Scientific Computing**: Pre-configured with pandas, numpy, matplotlib, seaborn, plotly, and sympy
- **Automatic Cleanup**: Background task removes expired sessions and orphaned files

---

## Architecture

```
┌─────────────────┐
│  JS Agent       │
│  (TypeScript)   │
└────────┬────────┘
         │
         │ MCP Protocol (HTTP)
         │
┌────────▼────────┐
│    MCP Server   │
│  (Python)       │
└────────┬────────┘
         │
         │ Manages
         │
┌────────▼────────┐
│ Session Manager │
│ - Create/Track  │
│ - Cleanup       │
└────────┬────────┘
         │
         │ Controls
         │
┌────────▼────────┐
│ Jupyter Kernels │
│ (per session)   │
└─────────────────┘
```

The JS agent calls `PythonCodeInterpreterTool`, which connects to the MCP server via `T12MCPClient` and invokes the `execute_code` tool. The code string passed is **Python** — it runs inside the server's Jupyter kernel, not in Node.js.

---

## Usage

The server exposes three tools and a resource endpoint for file access.

### 1. Execute Code

Execute Python code in a persistent Jupyter kernel environment.

**First execution (creates new session):**
```json
{
  "code": "import pandas as pd\nx = 42\nprint('Hello, World!')",
  "session_id": ""
}
```

**Response:**
```json
{
  "success": true,
  "output": ["Hello, World!\n"],
  "result": null,
  "session_info": {
    "session_id": "abc123xyz456",
    "instructions": "Use this `session_id` in subsequent requests..."
  }
}
```

**Subsequent executions (reuse session):**
```json
{
  "code": "print(x * 2)  # Variable persists from previous execution",
  "session_id": "abc123xyz456"
}
```

### 2. Create Visualizations

Matplotlib, seaborn, and Plotly figures are automatically captured and saved.

```json
{
  "code": "import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\nplt.plot(x, np.sin(x))\nplt.title('Sine Wave')\nplt.savefig('sine_wave.png')\nplt.show()",
  "session_id": "abc123xyz456"
}
```

**Response includes file references:**
```json
{
  "success": true,
  "output": ["📊 File created: sine_wave.png (image/png, 45231 bytes)"],
  "files": [
    {
      "uri": "kernel://abc123xyz456/sine_wave.png",
      "mime_type": "image/png",
      "name": "sine_wave.png",
      "size": 45231
    }
  ]
}
```

### 3. List Session Files

```json
{
  "session_id": "abc123xyz456"
}
```

### 4. Clear Session

Manually remove a session and all its files:

```json
{
  "session_id": "abc123xyz456"
}
```

### 5. Access Files

Files are accessed via the MCP resource protocol:

```
kernel://{session_id}/{filename}
```

Example: `kernel://abc123xyz456/sine_wave.png`

---

## How the JS Agent Invokes It

The agent calls `PythonCodeInterpreterTool.execute()`, which forwards the call to the MCP server via `T12MCPClient`. The tool serialises arguments as JSON and passes them to the `execute_code` MCP tool.

**First turn — load the script and open a session:**
```ts
// args passed to execute_code:
{
  code: "<contents of the Python script file>",
  session_id: ""   // empty string = new session
}
// Save session_id from response.session_info.session_id for subsequent calls
```

**Subsequent turns — reuse the session:**
```ts
{
  code: "convert_units(100, 'km', 'miles')",
  session_id: "abc123xyz456"
}
```

The `session_id` must be threaded through across turns so the Jupyter kernel retains the loaded script state.

---

## Session Management

### Session Lifecycle

1. **Creation**: First call with empty `session_id` generates a secure 16-character ID
2. **Active**: Session remains active while being used
3. **Timeout**: Sessions expire after **30 minutes of inactivity**
4. **Cleanup**: Expired sessions are automatically removed (background task runs every 5 minutes)

### Session Expiration

If you try to use an expired session, you'll receive a `SessionExpiredError`:

```json
{
  "success": false,
  "error": "SessionExpiredError: Session abc123xyz456 not found or has expired...",
  "traceback": []
}
```

**Solution**: Create a new session and re-execute the setup code (reload the script).

---

## Available Libraries

The following Python libraries are pre-installed in the execution environment:

- **Data Science**: pandas, numpy
- **Visualization**: matplotlib, seaborn, plotly, kaleido
- **Mathematics**: sympy
- **Jupyter**: ipykernel, jupyter-client

---

## API Reference

### Tools

#### `execute_code`

Execute Python code in a persistent Jupyter kernel environment.

**Parameters:**
- `code` (string): Python code to execute (multi-line supported)
- `session_id` (string, optional): Session identifier (empty or `"0"` for new session)

**Returns:**
- `success` (boolean): Execution status
- `output` (array): stdout/stderr text
- `result` (string | null): Last expression value
- `error` (string | null): Error message if failed
- `traceback` (array): Full traceback if error
- `files` (array): File references with URIs
- `session_info` (object | null): Session info on new session creation — contains `session_id` to reuse

#### `list_session_files`

List all files generated in a session.

**Parameters:**
- `session_id` (string): Session identifier

**Returns:**
- `session_id` (string): The session ID
- `files` (array): List of file references
- `error` (string): Error message if session not found

#### `clear_session`

Manually clear a session and shut down its kernel.

**Parameters:**
- `session_id` (string): Session identifier to clear

**Returns:**
- `success` (boolean): Operation status
- `message` (string): Status message

### Resources

#### `kernel://{session_id}/{filename}`

Retrieve file content from a session.

**URI Format:** `kernel://session_id/filename`

**Returns:** File content (binary for images, text for text files)
