import { randomUUID } from "crypto";

const MCP_SESSION_ID_HEADER = "mcp-session-id";

export type ToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
};

export class CustomMCPClient {
  private readonly serverUrl: string;
  private sessionId: string | null = null;

  private constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  static async create(serverUrl: string): Promise<CustomMCPClient> {
    const instance = new CustomMCPClient(serverUrl);
    await instance.connect();
    return instance;
  }

  private async _sendRequest(
    method: string,
    params?: Record<string, any>
  ): Promise<Record<string, any>> {
    // TODO:
    // 1. Build the JSON-RPC request body with jsonrpc, id (randomUUID()), method,
    //    and params (only include params field if params argument is provided).
    //    See the Postman collection for the expected request shape.
    // 2. Build headers: Content-Type application/json,
    //    Accept must include both "application/json" and "text/event-stream".
    //    For non-initialize requests add the session ID header (MCP_SESSION_ID_HEADER).
    // 3. POST to this.serverUrl with the body and headers using fetch().
    // 4. If the response has a session ID header and this.sessionId is not yet set,
    //    capture it: this.sessionId = response.headers.get(MCP_SESSION_ID_HEADER)
    // 5. If response status is 202, return {} (successful notification acknowledgement).
    // 6. Check the Content-Type of the response:
    //    - If it includes "text/event-stream": call await this._parseSseResponse(response)
    //    - Otherwise: parse as JSON with await response.json()
    // 7. If the parsed result contains an "error" field,
    //    throw new Error(`MCP Error ${error.code}: ${error.message}`)
    // 8. Return the parsed result.
    throw new Error("Not implemented");
  }

  private async _parseSseResponse(response: Response): Promise<Record<string, any>> {
    // TODO:
    // SSE response stream looks like:
    //   data: {"jsonrpc":"2.0","id":1,"result":{...}}
    //   data: [DONE]
    //
    // 1. Read the response body as text with await response.text().
    // 2. Split on newlines and iterate over the lines:
    //    - Skip empty lines or lines starting with ":"
    //    - For lines starting with "data: ":
    //        - Strip the "data: " prefix
    //        - If the remainder is "[DONE]", skip it
    //        - Otherwise JSON.parse it and return immediately
    //          (MCP returns the result in the first data chunk)
    // 3. If no valid data chunk was found, throw new Error("No valid data found in SSE response")
    throw new Error("Not implemented");
  }

  private async _sendNotification(method: string): Promise<void> {
    // TODO:
    // 1. Build the JSON-RPC notification body: { jsonrpc: "2.0", method }
    //    (notifications have no id or params)
    // 2. Build headers: Content-Type application/json,
    //    Accept must include both "application/json" and "text/event-stream".
    //    If this.sessionId is set, add the MCP_SESSION_ID_HEADER.
    // 3. POST to this.serverUrl with fetch().
    // 4. If the response contains a session ID header, capture it in this.sessionId
    //    and log it.
    throw new Error("Not implemented");
  }

  async connect(): Promise<void> {
    // TODO:
    // 1. Build the initialize params:
    //    { protocolVersion: "2024-11-05", capabilities: { tools: {} },
    //      clientInfo: { name: "my-custom-mcp-client", version: "1.0.0" } }
    // 2. Try:
    //    a. Call await this._sendRequest("initialize", initParams) and log the
    //       returned server capabilities.
    //    b. Call await this._sendNotification("notifications/initialized")
    // 3. Catch any error and rethrow as:
    //    new Error(`Failed to connect to MCP server: ${err}`)
    throw new Error("Not implemented");
  }

  async getTools(): Promise<ToolSchema[]> {
    // TODO:
    // 1. Call await this._sendRequest("tools/list") and get the response.
    // 2. Extract the tools array from response.result.tools.
    //    See the Postman collection for the response shape.
    // 3. Map each tool to OpenAI function-calling schema:
    //    { type: "function", function: { name, description, parameters: tool.inputSchema } }
    // https://platform.openai.com/docs/guides/function-calling#defining-functions
    throw new Error("Not implemented");
  }

  async callTool(toolName: string, toolArgs: Record<string, any>): Promise<string> {
    // TODO:
    // 1. Log: `    Calling \`${toolName}\` with` and toolArgs
    // 2. Call await this._sendRequest("tools/call", { name: toolName, arguments: toolArgs })
    //    Response shape:
    //    { jsonrpc: "2.0", id: "...", result: { content: [{ type: "text", text: "..." }] } }
    // 3. Extract content array from response.result.content
    // 4. Get the first item and its text field
    // 5. Log: `    ⚙️: ${textResult}\n`
    // 6. Return textResult, or "Unexpected error occurred!" if no content was found
    throw new Error("Not implemented");
  }
}
