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

  /**
   * Sends a JSON-RPC 2.0 POST request to the server and returns the parsed result.
   * @param method - The JSON-RPC method name (e.g. "tools/list").
   * @param params - Optional parameters object to include in the request body.
   * @returns The parsed JSON-RPC result as a plain object.
   * Hint: attach `Mcp-Session-Id` header when sessionId is set; parse SSE or JSON response.
   */
  private async _sendRequest(
    method: string,
    params?: Record<string, any>
  ): Promise<Record<string, any>> {
    // TODO
  }

  /**
   * Reads all SSE lines from a streaming response and extracts the last JSON-RPC result.
   * @param response - The raw fetch Response with `text/event-stream` content-type.
   * @returns The parsed result object from the final `data:` line containing a result field.
   * Hint: split text by newlines; look for lines starting with "data:"; parse JSON.
   */
  private async _parseSseResponse(response: Response): Promise<Record<string, any>> {
    // TODO
  }

  /**
   * Sends a JSON-RPC notification (fire-and-forget — no result expected).
   * @param method - The notification method name (e.g. "notifications/initialized").
   * Hint: same POST format as _sendRequest but id is null and response is not parsed.
   */
  private async _sendNotification(method: string): Promise<void> {
    // TODO
  }

  /**
   * Performs the MCP session handshake: initialize → store sessionId → send initialized notification.
   * Hint: call _sendRequest("initialize", {...}), extract session id from response headers,
   * then call _sendNotification("notifications/initialized").
   */
  async connect(): Promise<void> {
    // TODO
  }

  /**
   * Fetches the list of available tools from the server and maps them to ToolSchema.
   * @returns Array of ToolSchema objects ready to pass to the OpenAI tools parameter.
   * Hint: call _sendRequest("tools/list"); map result.tools to ToolSchema format.
   */
  async getTools(): Promise<ToolSchema[]> {
    // TODO
  }

  /**
   * Calls a named tool on the server and returns its text output as a string.
   * @param toolName - The tool name registered on the server.
   * @param toolArgs - Arguments object to pass to the tool.
   * @returns The text content of the first result item.
   * Hint: use _sendRequest("tools/call", { name, arguments }); extract content[0].text.
   */
  async callTool(toolName: string, toolArgs: Record<string, any>): Promise<string> {
    // TODO
  }
}
