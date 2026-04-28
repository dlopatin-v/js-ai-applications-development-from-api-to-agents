import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { BaseMcpClient } from "./base_mcp_client.js";
import { getLogger } from "../logger.js";
import { McpToolModel } from "../models.js";

const log = getLogger("stdio_mcp_client");

export class StdioMcpClient extends BaseMcpClient {
  private readonly _dockerImage: string;
  private _client: Client | null = null;

  private constructor(dockerImage: string) {
    super();
    this._dockerImage = dockerImage;
    log.debug("StdioMCPClient instance created", { docker_image: dockerImage });
  }

  /**
   * Async factory — launches the Docker container and establishes an MCP session.
   */
  static async create(dockerImage: string): Promise<StdioMcpClient> {
    log.info("Creating StdioMCPClient", { docker_image: dockerImage });
    const instance = new StdioMcpClient(dockerImage);
    await instance.connect();
    return instance;
  }

  async connect(): Promise<void> {
    log.info("Starting Docker container for MCP", { docker_image: this._dockerImage });
    const transport = new StdioClientTransport({
      command: "docker",
      args: ["run", "--rm", "-i", this._dockerImage],
    });

    log.debug("Initializing MCP session", { docker_image: this._dockerImage });
    const client = new Client({ name: "ums-agent-stdio-client", version: "1.0.0" });
    await client.connect(transport);
    this._client = client;

    log.info("MCP session initialized via stdio", {
      docker_image: this._dockerImage,
      capabilities: client.getServerCapabilities(),
      server_version: client.getServerVersion(),
    });
  }

  async getTools(): Promise<McpToolModel[]> {
    if (!this._client) {
      log.error("Attempted to get tools without active session", { docker_image: this._dockerImage });
      throw new Error("StdioMcpClient: not connected — call connect() first");
    }

    log.debug("Fetching tools from MCP server", { docker_image: this._dockerImage });
    const result = await this._client.listTools();
    const toolList: McpToolModel[] = result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema as Record<string, unknown>,
    }));

    log.info("Retrieved tools from MCP server", {
      docker_image: this._dockerImage,
      tool_count: toolList.length,
      tool_names: toolList.map((t) => t.name),
    });

    return toolList;
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<string> {
    if (!this._client) {
      log.error("Attempted to call tool without active session", {
        docker_image: this._dockerImage,
        tool_name: toolName,
      });
      throw new Error("StdioMcpClient: not connected — call connect() first");
    }

    log.info("Calling MCP tool via stdio", {
      docker_image: this._dockerImage,
      tool_name: toolName,
      tool_args: toolArgs,
    });

    const result = await this._client.callTool({ name: toolName, arguments: toolArgs });
    const content = result.content as Array<{ type: string; text?: string }>;

    if (!content.length) {
      log.warn("Tool returned no content", { tool_name: toolName, docker_image: this._dockerImage });
      return "No content returned from tool";
    }

    const first = content[0];
    log.debug("MCP tool result received", { tool_name: toolName, content: first });

    if (first.type === "text") {
      return first.text ?? "";
    }

    return JSON.stringify(first);
  }
}
