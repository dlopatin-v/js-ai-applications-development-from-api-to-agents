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
    // TODO:
    // 1. Call this.client.listTools() to get available tools from the MCP server
    // 2. Map each tool to a ToolSchema object:
    //    { type: "function", function: { name, description, parameters: tool.inputSchema } }
    // 3. Return the mapped array
    throw new Error("Not implemented");
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    // TODO:
    // 1. Log the tool name and args
    // 2. Call this.client.callTool({ name: toolName, arguments: toolArgs })
    // 3. Extract content[0] from result.content
    // 4. Log the content
    // 5. If content has a "text" property — return content.text
    // 6. Otherwise return content
    throw new Error("Not implemented");
  }
}
