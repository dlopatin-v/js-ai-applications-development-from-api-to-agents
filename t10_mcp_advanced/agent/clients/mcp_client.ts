import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type ToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
};

export class MCPClient {
  private client: Client;
  private readonly serverUrl: string;

  private constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.client = new Client({ name: "mcp-client", version: "1.0.0" });
  }

  static async create(serverUrl: string): Promise<MCPClient> {
    const instance = new MCPClient(serverUrl);
    await instance.connect();
    return instance;
  }

  /**
   * Establishes the MCP connection via StreamableHTTPClientTransport.
   * @returns Promise that resolves when the connection handshake is complete.
   * Hint: create a new StreamableHTTPClientTransport(new URL(serverUrl)) and call
   * this.client.connect(transport).
   */
  private async connect(): Promise<void> {
    // TODO
  }

  /**
   * Retrieves all tools exposed by the server and converts them to ToolSchema format.
   * @returns Array of ToolSchema objects suitable for the OpenAI tools parameter.
   * Hint: call this.client.listTools(); map each tool to { type: "function", function: {...} }.
   */
  async getTools(): Promise<ToolSchema[]> {
    // TODO
  }

  /**
   * Invokes a tool by name and returns its text result.
   * @param toolName - The name of the tool to call.
   * @param toolArgs - Argument object forwarded to the tool.
   * @returns The text content of the first result item as a string.
   * Hint: call this.client.callTool({ name, arguments }); extract content[0].text.
   */
  async callTool(toolName: string, toolArgs: Record<string, any>): Promise<string> {
    // TODO
  }
}
