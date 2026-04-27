import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { MCPClient } from "./base";

export class HttpMCPClient extends MCPClient {
  private readonly serverUrl: string;

  constructor(mcpServerUrl: string) {
    super("http-mcp-client");
    this.serverUrl = mcpServerUrl;
  }

  async connect(): Promise<void> {
    // TODO:
    // 1. Create a StreamableHTTPClientTransport using new URL(this.serverUrl)
    // 2. Call await this.client.connect(transport)
    // 3. Log: `Connected to MCP server at ${this.serverUrl}`
    throw new Error("Not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO: Call await this.client.close()
    throw new Error("Not implemented");
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}
