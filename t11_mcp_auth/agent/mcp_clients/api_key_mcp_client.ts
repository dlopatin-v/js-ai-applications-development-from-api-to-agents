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

  /**
   * Creates a StreamableHTTPClientTransport with a custom fetch function that injects
   * the X-API-Key header, then connects this.client to the MCP server.
   * @returns Promise that resolves when the MCP handshake is complete.
   * Hint: pass a `fetch` override to StreamableHTTPClientTransport options that
   * merges { "X-API-Key": this.apiKey } into every request's headers.
   */
  async connect(): Promise<void> {
    // TODO
  }

  /**
   * Closes the transport connection and cleans up resources.
   * @returns Promise that resolves when disconnection is complete.
   * Hint: call this.transport?.close() if transport is set.
   */
  async disconnect(): Promise<void> {
    // TODO
  }
}
