import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/**
 * Abstract base class for T11 MCP clients with auth support.
 * Subclasses inject authentication headers into every request.
 */
export abstract class T11MCPClient {
  protected client: Client;

  constructor(clientName: string, clientVersion = "1.0.0") {
    this.client = new Client({ name: clientName, version: clientVersion });
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  async getTools(): Promise<ToolSchema[]> {
    const result = await this.client.listTools();
    return result.tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema as Record<string, unknown>,
      },
    }));
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    console.log(`    Calling \`${toolName}\` with`, toolArgs);
    const result = await this.client.callTool({ name: toolName, arguments: toolArgs });
    const content = (result.content as any)[0];
    console.log(`    ⚙️:`, content, "\n");
    if (content && "text" in content) return content.text;
    return content;
  }
}
