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
    // TODO:
    // 1. Call `this.client.listTools()` (it is async) and assign result to `result`
    // 2. Return result.tools mapped to OpenAI function-calling schema:
    //    [
    //      {
    //        type: "function",
    //        function: {
    //          name: tool.name,
    //          description: tool.description ?? "",
    //          parameters: tool.inputSchema as Record<string, unknown>,
    //        },
    //      }
    //    ]
    throw new Error("Not implemented");
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    // TODO:
    // 1. console.log(`    🔧 Calling \`${toolName}\` with`, toolArgs)
    // 2. Call `this.client.callTool({ name: toolName, arguments: toolArgs })` (it is async) and assign to `result`
    // 3. Get `content` from `result.content[0]`
    // 4. console.log(`    ⚙️:`, content, "\n")
    // 5. If `content` exists and has a `"text"` property -> return content.text
    //    else -> return content
    throw new Error("Not implemented");
  }

  async getResources(): Promise<Resource[]> {
    // TODO:
    // Wrap into try/catch (not all MCP servers support resources):
    //   - Call `this.client.listResources()` (it is async) and assign to `result`
    //   - Return result.resources
    //   - In case of error: print the error and return an empty array
    throw new Error("Not implemented");
  }

  async getResource(uri: string): Promise<string | Uint8Array> {
    // TODO:
    // 1. Call `this.client.readResource({ uri })` (it is async) and assign to `result`
    // 2. Get `content` from `result.contents[0]`
    // 3. The content can be one of two types:
    //    - If `"text"` is in content  -> return content.text
    //    - If `"blob"` is in content  -> return Buffer.from(content.blob, "base64")
    // 4. If neither, throw new Error(`Unexpected resource content type`)
    // ---
    // Optional: in app.ts you can try fetching this resource and printing it
    // (in our case it is image/png provided as base64, but you can return a plain
    // object on the server side just to see how resources look).
    throw new Error("Not implemented");
  }

  async getPrompts(): Promise<Prompt[]> {
    // TODO:
    // Wrap into try/catch (not all MCP servers support prompts):
    //   - Call `this.client.listPrompts()` (it is async) and assign to `result`
    //   - Return result.prompts
    //   - In case of error: print the error and return an empty array
    throw new Error("Not implemented");
  }

  async getPrompt(name: string): Promise<string> {
    // TODO:
    // 1. Call `this.client.getPrompt({ name })` (it is async) and assign to `result`
    // 2. Create variable `combinedContent` with an empty string
    // 3. Iterate through `result.messages` and for each `msg`:
    //    - If `msg.content` exists and is an object with a `"text"` property
    //      -> append `msg.content.text` to `combinedContent`
    //    - Otherwise -> append `String(msg.content ?? "")` to `combinedContent`
    // 4. Return `combinedContent`
    throw new Error("Not implemented");
  }
}
