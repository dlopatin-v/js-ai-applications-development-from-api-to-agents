import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { T11MCPClient } from "./_base";

/**
 * MCP client that authenticates with the server using an API key.
 * Adds the X-API-Key header to every HTTP request via a custom fetch wrapper.
 */
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
    // TODO
  }

  async disconnect(): Promise<void> {
    // TODO
  }
}
