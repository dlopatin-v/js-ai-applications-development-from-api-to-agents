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
    // TODO
  }

  private async _parseSseResponse(response: Response): Promise<Record<string, any>> {
    // TODO
  }

  private async _sendNotification(method: string): Promise<void> {
    // TODO
  }

  async connect(): Promise<void> {
    // TODO
  }

  async getTools(): Promise<ToolSchema[]> {
    // TODO
  }

  async callTool(toolName: string, toolArgs: Record<string, any>): Promise<string> {
    // TODO
  }
}
