import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { T11MCPClient } from "./_base";

export class ApiKeyMCPClient extends T11MCPClient {
  private readonly serverUrl: string;
  private readonly apiKey: string;
  private transport: StreamableHTTPClientTransport | null = null;

  constructor(serverUrl: string, apiKey: string) {
    super("api-key-mcp-client");
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    //TODO:
    // 1. Create a StreamableHTTPClientTransport with a custom fetch that injects
    //    { "X-API-Key": this.apiKey } into every request's headers
    //    Assign to this.transport
    // 2. Call await this.client.connect(this.transport)
    // 3. Log: `Connected to API Key MCP server at ${this.serverUrl}`
  }

  async disconnect(): Promise<void> {
    //TODO:
    // 1. Call await this.transport?.close() if transport is set
  }
}
