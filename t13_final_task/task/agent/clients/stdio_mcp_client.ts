import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { BaseMcpClient } from "./base_mcp_client.js";
import { McpToolModel } from "../models.js";

export class StdioMcpClient extends BaseMcpClient {
  private readonly _dockerImage: string;
  private _client: Client | null = null;

  private constructor(dockerImage: string) {
    super();
    this._dockerImage = dockerImage;
  }

  /**
   * Async factory — launches the Docker container and establishes an MCP session.
   */
  static async create(dockerImage: string): Promise<StdioMcpClient> {
    const instance = new StdioMcpClient(dockerImage);
    await instance.connect();
    return instance;
  }

  async connect(): Promise<void> {
    const transport = new StdioClientTransport({
      command: "docker",
      args: ["run", "--rm", "-i", this._dockerImage],
    });

    const client = new Client({ name: "ums-agent-stdio-client", version: "1.0.0" });
    await client.connect(transport);
    this._client = client;
  }

  async getTools(): Promise<McpToolModel[]> {
    if (!this._client) {
      throw new Error("StdioMcpClient: not connected — call connect() first");
    }

    const result = await this._client.listTools();
    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema as Record<string, unknown>,
    }));
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<string> {
    if (!this._client) {
      throw new Error("StdioMcpClient: not connected — call connect() first");
    }

    const result = await this._client.callTool({ name: toolName, arguments: toolArgs });
    const content = result.content as Array<{ type: string; text?: string }>;

    if (!content.length) {
      return "No content returned from tool";
    }

    const first = content[0];

    if (first.type === "text") {
      return first.text ?? "";
    }

    return JSON.stringify(first);
  }
}
