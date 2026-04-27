import Anthropic, { ParsedMessage } from "@anthropic-ai/sdk";

import { BaseAgent } from "./_base";
import { BaseTool } from "../tools/base";

import { ANTHROPIC_ENDPOINT, Message, Role } from "../../../commons";

export class AnthropicBasedAgent extends BaseAgent {
  private readonly _toolsSchemas: Record<string, unknown>[];
  private readonly _endpoint: string;

  constructor(
    model: string,
    apiKey: string,
    tools: BaseTool[] = [],
    systemPrompt?: string,
  ) {
    super(model, apiKey, tools, systemPrompt);
    this._toolsSchemas = tools.map((t) => t.anthropicSchema);
    this._endpoint = ANTHROPIC_ENDPOINT;

    console.log(this._endpoint);
    console.log(JSON.stringify(this._toolsSchemas, null, 4));
  }

  async getResponse(messages: Message[], printRequest = true): Promise<Message> {
    //TODO:
    // 1. Build headers: { "x-api-key": this._apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }
    // 2. Convert messages to Anthropic format using this._toAnthropicMessages(messages)
    //    Note: Anthropic does NOT accept a system message inside the messages array —
    //    pass this._systemPrompt as a top-level "system" field in the request body instead
    // 3. Build body: { model, max_tokens: 8096, messages, tools: this._toolsSchemas }
    //    If this._systemPrompt is set, also add: system: this._systemPrompt
    // 4. If printRequest: log this._endpoint and the request messages
    // 5. POST to this._endpoint; on non-ok status throw: new Error(`HTTP ${response.status}: ${text}`)
    // 6. Parse response JSON; extract content (blocks array) and stop_reason
    //    If printRequest: log the response
    //    Find text block: blocks.find(b => b.type === "text")?.text
    //    Find tool_use blocks: blocks.filter(b => b.type === "tool_use")
    //    Build: new Message(Role.ASSISTANT, textContent, undefined, undefined,
    //             toolUseBlocks.length > 0 ? contentBlocks : undefined)
    //    If stop_reason === "tool_use":
    //      - Append ai_response to messages
    //      - tool_messages = await this._processToolCalls(toolUseBlocks)
    //      - Extend messages with tool_messages
    //      - Recursively call this.getResponse(messages, printRequest) and return result
    //    Otherwise return ai_response
    throw new Error("Not implemented");
  }

  private _toAnthropicMessages(
    messages: Message[],
  ): Array<Record<string, unknown>> {
    //TODO:
    // Walk messages with index i and build result array:
    //   if messages[i].role === Role.TOOL:
    //     Collect all consecutive TOOL messages into tool_results:
    //       [{ type: "tool_result", tool_use_id: msg.toolCallId, content: msg.content }, ...]
    //     Push { role: "user", content: tool_results } to result; advance i past them
    //   else if messages[i].role === Role.ASSISTANT:
    //     content = msg.toolCalls ?? msg.content
    //     Push { role: "assistant", content } to result
    //   else (USER):
    //     Push { role: msg.role, content: msg.content } to result
    // Return result
    throw new Error("Not implemented");
  }

  private async _processToolCalls(
    toolUseBlocks: Array<Record<string, unknown>>,
  ): Promise<Message[]> {
    //TODO:
    // For each block in toolUseBlocks (shape: { type, id, name, input }):
    // 1. Extract id (tool_use_id), name, input (already parsed — no JSON.parse needed)
    // 2. Call await this._callTool(name, input) to get toolExecutionResult
    // 3. Build: new Message(Role.TOOL, toolExecutionResult, id, name)
    // 4. Print: `FUNCTION '${name}'\n${toolExecutionResult}\n${"-".repeat(50)}`
    // Return the list of tool result Messages
    throw new Error("Not implemented");
  }

  private async _callTool(
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    //TODO:
    // 1. Look up the tool in this._toolsDict by functionName
    // 2. If found, call await tool.execute(args) and return the result
    // 3. If not found, return `Unknown function: ${functionName}`
    throw new Error("Not implemented");
  }
}
