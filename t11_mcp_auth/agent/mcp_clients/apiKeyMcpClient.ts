import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { T11MCPClient } from "./_base.js";

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
    const apiKey = this.apiKey;
    this.transport = new StreamableHTTPClientTransport(new URL(this.serverUrl), {
      requestInit: {
        headers: { "X-API-Key": apiKey },
      },
    });
    await this.client.connect(this.transport);
    const caps = this.client.getServerCapabilities();
    console.log("Connected (API Key). Server capabilities:", JSON.stringify(caps));
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    this.transport = null;
  }
}
