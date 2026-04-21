import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type ToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
};

export class MCPClient {
  private client: Client;
  private readonly serverUrl: string;

  private constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.client = new Client({ name: "mcp-client", version: "1.0.0" });
  }

  static async create(serverUrl: string): Promise<MCPClient> {
    const instance = new MCPClient(serverUrl);
    await instance.connect();
    return instance;
  }

  private async connect(): Promise<void> {
    // TODO
  }

  async getTools(): Promise<ToolSchema[]> {
    // TODO
  }

  async callTool(toolName: string, toolArgs: Record<string, any>): Promise<string> {
    // TODO
  }
}
