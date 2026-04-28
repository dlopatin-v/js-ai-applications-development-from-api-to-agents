import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { BaseMcpClient } from "./base_mcp_client.js";
import { getLogger } from "../logger.js";
import { McpToolModel } from "../models.js";

const log = getLogger("http_mcp_client");

export class HttpMcpClient extends BaseMcpClient {
  private readonly _serverUrl: string;
  private _client: Client | null = null;

  private constructor(serverUrl: string) {
    super();
    this._serverUrl = serverUrl;
    log.debug("HttpMcpClient instance created", { server_url: serverUrl });
  }

  /**
   * Async factory — creates the client and establishes an MCP session.
   */
  static async create(serverUrl: string): Promise<HttpMcpClient> {
    log.info("Creating HttpMcpClient", { server_url: serverUrl });
    const instance = new HttpMcpClient(serverUrl);
    await instance.connect();
    return instance;
  }

  async connect(): Promise<void> {
    log.info("Connecting to MCP server", { server_url: this._serverUrl });
    const client = new Client({ name: "ums-agent-http-client", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL(this._serverUrl));
    await client.connect(transport);
    this._client = client;
    log.info("MCP session initialized", {
      server_url: this._serverUrl,
      server_capabilities: client.getServerCapabilities(),
      server_version: client.getServerVersion(),
    });
  }

  async getTools(): Promise<McpToolModel[]> {
    if (!this._client) {
      log.error("Attempted to get tools without active session");
      throw new Error("HttpMcpClient: not connected — call connect() first");
    }

    log.debug("Fetching tools from MCP server", { server_url: this._serverUrl });
    const result = await this._client.listTools();
    const toolList: McpToolModel[] = result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema as Record<string, unknown>,
    }));

    log.info("Retrieved tools from MCP server", {
      server_url: this._serverUrl,
      tool_count: toolList.length,
      tool_names: toolList.map((t) => t.name),
    });

    return toolList;
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<string> {
    if (!this._client) {
      log.error("Attempted to call tool without active session", { tool_name: toolName });
      throw new Error("HttpMcpClient: not connected — call connect() first");
    }

    log.info("Calling MCP tool", {
      server_url: this._serverUrl,
      tool_name: toolName,
      tool_args: toolArgs,
    });

    const result = await this._client.callTool({ name: toolName, arguments: toolArgs });
    const content = result.content as Array<{ type: string; text?: string }>;
    const first = content[0];

    log.debug("MCP tool result received", { tool_name: toolName, content });

    if (!first) {
      return "No content returned from tool";
    }

    if (first.type === "text") {
      return first.text ?? "";
    }

    return JSON.stringify(first);
  }
}
