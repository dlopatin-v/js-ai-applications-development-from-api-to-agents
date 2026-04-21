import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { MCPToolModel } from "./mcp_tool_model.js";

export class T12MCPClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport | null = null;

  constructor(private readonly mcpServerUrl: string) {
    this.client = new Client({ name: "t12-mcp-client", version: "1.0.0" });
  }

  /**
   * Factory method: create and connect a T12MCPClient in one call.
   * @param mcpServerUrl - Full URL of the MCP server (e.g. http://localhost:8050/mcp)
   * @returns A connected T12MCPClient instance ready for use.
   * Hint: construct the instance, call connect(), then return it.
   */
  static async create(mcpServerUrl: string): Promise<T12MCPClient> {
    // TODO
  }

  /**
   * Connect to the MCP server using StreamableHTTPClientTransport.
   * Hint: create a new StreamableHTTPClientTransport from `new URL(this.mcpServerUrl)`,
   * store it in `this.transport`, then call `this.client.connect(transport)`.
   */
  async connect(): Promise<void> {
    // TODO
  }

  /**
   * Retrieve the list of tools available on the MCP server.
   * @returns Array of MCPToolModel with name, description, and parameters.
   * Hint: use `this.client.listTools()`, then map each tool to an MCPToolModel.
   * Use `tool.inputSchema` cast to `Record<string, unknown>` for parameters.
   */
  async getTools(): Promise<MCPToolModel[]> {
    // TODO
  }

  /**
   * Invoke a named tool on the MCP server.
   * @param name - Tool name to call.
   * @param args - Arguments object to pass to the tool.
   * @returns The tool's text output as a string. If no content, return "".
   * Hint: use `this.client.callTool({ name, arguments: args })`.
   * Check `result.content[0]` — if type is "text", return `.text`; otherwise JSON.stringify it.
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    // TODO
  }

  /**
   * Close the MCP client connection gracefully.
   * Hint: call `this.client.close()`.
   */
  async close(): Promise<void> {
    // TODO
  }
}
