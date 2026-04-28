import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Resource, Prompt, TextContent, CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type ToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export abstract class MCPClient {
  protected client: Client;

  constructor(clientName: string, clientVersion = "1.0.0") {
    this.client = new Client({ name: clientName, version: clientVersion });
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  /**
   * Print the negotiated initialize result (server info, capabilities,
   * instructions). Intended to be called by subclasses right after
   * `this.client.connect(transport)` succeeds. Mirrors Python's
   * `print(init_result.model_dump_json(indent=2))`.
   */
  protected printInitResult(): void {
    const initResult = {
      serverInfo: this.client.getServerVersion() ?? null,
      capabilities: this.client.getServerCapabilities() ?? null,
      instructions: this.client.getInstructions() ?? null,
    };
    console.log(JSON.stringify(initResult, null, 2));
  }

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

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<string> {
    console.log(`    🔧 Calling ${toolName} with ${JSON.stringify(toolArgs)}`);
    const result = await this.client.callTool({ name: toolName, arguments: toolArgs }) as CallToolResult;
    const content = result.content[0] as TextContent;

    console.log(`    ⚙️:`, content, "\n");

    if (content.text) return content.text;
    return String(content);
  }

  async getResources(): Promise<Resource[]> {
    try {
      const result = await this.client.listResources();
      return result.resources;
    } catch (error) {
      console.warn(`Server doesn't support list_resources: ${error}`);
      return [];
    }
  }

  async getResource(uri: string): Promise<string | Uint8Array> {
    const result = await this.client.readResource({ uri });
    const content = result.contents[0];

    if ("text" in content) return content.text;
    if ("blob" in content) return Buffer.from(content.blob, "base64");
    throw new Error(`Unknown resource type for ${uri}`);
  }

  async getPrompts(): Promise<Prompt[]> {
    try {
      const result = await this.client.listPrompts();
      return result.prompts;
    } catch (error) {
      console.warn(`Server doesn't support list_prompts: ${error}`);
      return [];
    }
  }

  async getPrompt(name: string): Promise<string> {
    const result = await this.client.getPrompt({ name });

    if (result.messages[0].content.type == "text") {
      return result.messages[0].content.text;
    }

    return result.messages[0].content.toString();
  }
}
