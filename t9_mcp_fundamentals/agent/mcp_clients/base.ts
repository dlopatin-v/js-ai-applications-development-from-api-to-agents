import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Resource, Prompt } from "@modelcontextprotocol/sdk/types.js";

// TODO:
//  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md
//  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md#tools
//  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md#resources
//  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md#prompts

export interface ToolSchema {
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
    const content = result.content[0];
    console.log(`    ⚙️:`, content, "\n");
    if (content && "text" in content) return content.text;
    return content;
  }

  async getResources(): Promise<Resource[]> {
    const result = await this.client.listResources();
    return result.resources;
  }

  async getResource(uri: string): Promise<string | Uint8Array> {
    const result = await this.client.readResource({ uri });
    const content = result.contents[0];
    if ("text" in content) return content.text;
    if ("blob" in content) return Buffer.from(content.blob, "base64");
    throw new Error(`Unexpected resource content type`);
  }

  async getPrompts(): Promise<Prompt[]> {
    const result = await this.client.listPrompts();
    return result.prompts;
  }

  async getPrompt(name: string): Promise<string> {
    const result = await this.client.getPrompt({ name });
    const msg = result.messages[0];
    if (msg && typeof msg.content === "object" && "text" in msg.content) {
      return msg.content.text;
    }
    return String(msg?.content ?? "");
  }
}
