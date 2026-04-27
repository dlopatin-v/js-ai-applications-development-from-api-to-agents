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
    // TODO:
    // 1. Create a StreamableHTTPClientTransport for this.serverUrl
    //    Pass a requestInit with headers: { "X-API-Key": this.apiKey }
    //    so the key is sent on every request automatically
    // 2. Assign the transport to this.transport
    // 3. Connect the SDK client: await this.client.connect(this.transport)
    // 4. Read server capabilities with this.client.getServerCapabilities()
    //    and log them (JSON.stringify)
    throw new Error("Not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO:
    // 1. Close the SDK client: await this.client.close()
    // 2. Set this.transport = null
    throw new Error("Not implemented");
  }
}
