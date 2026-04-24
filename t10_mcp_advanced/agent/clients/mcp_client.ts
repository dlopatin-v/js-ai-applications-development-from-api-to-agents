import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type ToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
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

  private async connect(): Promise<void> {
    const transport = new StreamableHTTPClientTransport(new URL(this.serverUrl));
    await this.client.connect(transport);
    const initResult = await this.client.getServerCapabilities();
    console.log(JSON.stringify(initResult, null, 2));
  }

  async getTools(): Promise<ToolSchema[]> {
    const result = await this.client.listTools();
    return result.tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema as Record<string, unknown>,
      },
    }));
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<string> {
    console.log(`    Calling \`${toolName}\` with`, toolArgs);
    const result = await this.client.callTool({ name: toolName, arguments: toolArgs }) as CallToolResult;
    const content = result.content;
    if (Array.isArray(content) && content.length > 0) {
      const item = content[0] as { type: string; text?: string };
      const text = item.text ?? String(item);
      console.log(`    ⚙️: ${text}\n`);
      return text;
    }
    return "Unexpected error occurred!";
  }
}