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
    //TODO:
    // 1. Build request body: { jsonrpc: "2.0", id: randomUUID(), method, ...(params ? { params } : {}) }
    // 2. Build headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" }
    //    If method !== "initialize" and this.sessionId is set, add MCP_SESSION_ID_HEADER header
    // 3. POST to this.serverUrl with JSON body and headers
    //    If !this.sessionId and the response has MCP_SESSION_ID_HEADER, capture it in this.sessionId
    //    If response.status === 202, return {} (successful notification)
    // 4. Check content-type:
    //    If it includes "text/event-stream": call await this._parseSseResponse(response)
    //    Otherwise: await response.json()
    // 5. If "error" in responseData, throw: new Error(`MCP Error ${error.code}: ${error.message}`)
    // 6. Return responseData
  }

  private async _parseSseResponse(response: Response): Promise<Record<string, any>> {
    //TODO:
    // 1. Read all text: await response.text()
    // 2. Split by newlines and iterate
    // 3. For each line starting with "data: ", extract the data part (remove "data: " prefix)
    //    If data part !== "[DONE]": return JSON.parse(data part)
    //    (return on first valid data chunk — MCP tool response fits in one chunk)
    // 4. throw new Error("No valid data found in SSE response")
  }

  private async _sendNotification(method: string): Promise<void> {
    //TODO:
    // 1. Build request body: { jsonrpc: "2.0", method } (no id for notifications)
    // 2. Build headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" }
    //    If this.sessionId is set, add MCP_SESSION_ID_HEADER header
    // 3. POST to this.serverUrl; if response has MCP_SESSION_ID_HEADER, update this.sessionId
  }

  async connect(): Promise<void> {
    //TODO:
    // 1. Call this._sendRequest("initialize", { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "my-custom-mcp-client", version: "1.0.0" } })
    //    and log the result (server capabilities)
    // 2. Call await this._sendNotification("notifications/initialized")
  }

  async getTools(): Promise<ToolSchema[]> {
    //TODO:
    // 1. Call await this._sendRequest("tools/list") and get response
    // 2. Extract tools = response.result.tools
    // 3. Map each tool to ToolSchema: { type: "function", function: { name, description, parameters: tool.inputSchema } }
    // 4. Return the mapped array
  }

  async callTool(toolName: string, toolArgs: Record<string, any>): Promise<string> {
    //TODO:
    // 1. Log: `    Calling \`${toolName}\` with ${JSON.stringify(toolArgs)}`
    // 2. Call await this._sendRequest("tools/call", { name: toolName, arguments: toolArgs })
    // 3. Extract content = response.result?.content ?? []
    // 4. Extract text = content[0]?.text ?? ""
    // 5. Log: `    ⚙️: ${text}\n`
    // 6. Return text (or "Unexpected error occurred!" if no content)
  }
}
