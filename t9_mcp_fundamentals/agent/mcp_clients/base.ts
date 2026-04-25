import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Resource, Prompt } from "@modelcontextprotocol/sdk/types.js";

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
    //TODO:
    //  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md
    //  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md#tools
    // 1. Call this.client.listTools() and get the tools list
    // 2. Return it mapped to OpenAI tool schema format:
    //    { type: "function", function: { name, description, parameters: tool.inputSchema } }
    // https://platform.openai.com/docs/guides/function-calling
    throw new Error("Not implemented");
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    //TODO:
    // 1. Log: `    Calling \`${toolName}\` with` and toolArgs
    // 2. Call this.client.callTool({ name: toolName, arguments: toolArgs })
    // 3. Get content at index 0 from result.content
    // 4. Log: `    ⚙️:` content
    // 5. If content has a "text" property return content.text, else return content
    throw new Error("Not implemented");
  }

  async getResources(): Promise<Resource[]> {
    // TODO:
    //  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md#resources
    // Wrap in try/catch (not all MCP servers have resources):
    //   Call this.client.listResources() and return result.resources
    //   On error: print the error and return []
    throw new Error("Not implemented");
  }

  async getResource(uri: string): Promise<string | Uint8Array> {
    // TODO:
    // 1. Call this.client.readResource({ uri }) and get contents[0]
    // 2. If content has "text" return content.text
    // 3. If content has "blob" return Buffer.from(content.blob, "base64")
    // 4. Otherwise throw an error
    throw new Error("Not implemented");
  }

  async getPrompts(): Promise<Prompt[]> {
    //TODO:
    //  https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md#prompts
    // Wrap in try/catch (not all MCP servers have prompts):
    //   Call this.client.listPrompts() and return result.prompts
    //   On error: print the error and return []
    throw new Error("Not implemented");
  }

  async getPrompt(name: string): Promise<string> {
    // TODO:
    // 1. Call this.client.getPrompt({ name })
    // 2. Iterate through result.messages and build a combined string:
    //    - if message.content has a "text" property: append content.text + "\n"
    //    - otherwise: append String(message.content) + "\n"
    // 3. Return the combined string
    throw new Error("Not implemented");
  }
}
