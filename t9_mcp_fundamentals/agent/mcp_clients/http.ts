import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { MCPClient } from "./base.js";

export class HttpMCPClient extends MCPClient {
  private readonly serverUrl: string;

  constructor(mcpServerUrl: string) {
    super("http-mcp-client");
    this.serverUrl = mcpServerUrl;
  }

  /**
   * Connects to the MCP server over HTTP using StreamableHTTPClientTransport.
   *
   * Steps:
   * 1. Create a `StreamableHTTPClientTransport` using `new URL(this.serverUrl)`.
   * 2. Call `await this.client.connect(transport)` to establish the connection.
   * 3. Log: `Connected to MCP server at ${this.serverUrl}`
   */
  async connect(): Promise<void> {
    // TODO: Create a StreamableHTTPClientTransport using new URL(this.serverUrl).
    //   Call await this.client.connect(transport).
    //   Log: `Connected to MCP server at ${this.serverUrl}`
    throw new Error("Not implemented");
  }

  /**
   * Closes the connection to the MCP server.
   *
   * Steps:
   * 1. Call `await this.client.close()` to close the connection.
   */
  async disconnect(): Promise<void> {
    // TODO: Call await this.client.close() to close the connection.
    throw new Error("Not implemented");
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}
