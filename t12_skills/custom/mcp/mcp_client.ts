import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { MCPToolModel } from "./mcp_tool_model.js";

export class T12MCPClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport | null = null;

  constructor(private readonly mcpServerUrl: string) {
    this.client = new Client({ name: "t12-mcp-client", version: "1.0.0" });
  }

  static async create(mcpServerUrl: string): Promise<T12MCPClient> {
    const instance = new T12MCPClient(mcpServerUrl);
    await instance.connect();
    return instance;
  }

  async connect(): Promise<void> {
    // TODO
  }

  async getTools(): Promise<MCPToolModel[]> {
    // TODO
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    // TODO
  }

  async close(): Promise<void> {
    // TODO
  }
}
