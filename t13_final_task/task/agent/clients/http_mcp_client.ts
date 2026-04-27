import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { BaseMcpClient } from "./base_mcp_client.js";
import { McpToolModel } from "../models.js";

export class HttpMcpClient extends BaseMcpClient {
  private readonly _serverUrl: string;
  private _client: Client | null = null;

  private constructor(serverUrl: string) {
    super();
    this._serverUrl = serverUrl;
  }

  /**
   * Async factory — creates the client and establishes an MCP session.
   */
  static async create(serverUrl: string): Promise<HttpMcpClient> {
    const instance = new HttpMcpClient(serverUrl);
    await instance.connect();
    return instance;
  }

  async connect(): Promise<void> {
    const client = new Client({ name: "ums-agent-http-client", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL(this._serverUrl));
    await client.connect(transport);
    this._client = client;
  }

  async getTools(): Promise<McpToolModel[]> {
    if (!this._client) {
      throw new Error("HttpMcpClient: not connected — call connect() first");
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
      throw new Error("HttpMcpClient: not connected — call connect() first");
    }

    const result = await this._client.callTool({ name: toolName, arguments: toolArgs });
    const content = result.content as Array<{ type: string; text?: string }>;
    const first = content[0];

    if (!first) {
      return "No content returned from tool";
    }

    if (first.type === "text") {
      return first.text ?? "";
    }

    return JSON.stringify(first);
  }
}
