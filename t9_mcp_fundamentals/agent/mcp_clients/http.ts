import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { MCPClient } from "./base.js";

export class HttpMCPClient extends MCPClient {
  private readonly serverUrl: string;

  constructor(mcpServerUrl: string) {
    super("http-mcp-client");
    this.serverUrl = mcpServerUrl;
  }

  async connect(): Promise<void> {
    const transport = new StreamableHTTPClientTransport(new URL(this.serverUrl));
    await this.client.connect(transport);
    console.log(`Connected to MCP server at ${this.serverUrl}`);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}
