import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPToolModel } from "./mcp_tool_model.js";

const DOCKER_IMAGE = "mcp/node-code-sandbox";

export class T12MCPClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;

  constructor() {
    this.client = new Client({ name: "t12-mcp-client", version: "1.0.0" });
  }

  static async create(): Promise<T12MCPClient> {
    const instance = new T12MCPClient();
    await instance.connect();
    return instance;
  }

  async connect(): Promise<void> {
    this.transport = new StdioClientTransport({
      command: "docker",
      args: ["run", "--rm", "-i", DOCKER_IMAGE],
    });
    await this.client.connect(this.transport);
  }

  async getTools(): Promise<MCPToolModel[]> {
    const result = await this.client.listTools();
    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema as Record<string, unknown>,
    }));
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const result = await this.client.callTool({ name, arguments: args }) as { content: { type: string; text?: string }[] };
    if (!result.content || result.content.length === 0) return "";
    const content = result.content[0];
    if (content.type === "text") return content.text ?? "";
    return JSON.stringify(content);
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
