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
        parameters: tool.inputSchema as Record<string, any>,
      },
    }));
  }

  async callTool(toolName: string, toolArgs: Record<string, any>): Promise<string> {
    console.log(`    Calling \`${toolName}\` with`, toolArgs);
    const result = await this.client.callTool({ name: toolName, arguments: toolArgs });
    const content = result.content;
    if (Array.isArray(content) && content.length > 0) {
      const item = content[0] as any;
      const text = item.text ?? String(item);
      console.log(`    ⚙️: ${text}\n`);
      return text;
    }
    return "Unexpected error occurred!";
  }
}
