import { ANTHROPIC_ENDPOINT } from "../../../commons/constants";
import { Message } from "../../../commons/models/message";
import { Role } from "../../../commons/models/role";
import { BaseTool } from "../tools/base";
import { BaseAgent } from "./_base";

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
    // TODO: Implement the Anthropic tool-calling agentic loop.
    //
    // Step 1 — Convert messages to Anthropic format.
    //   Call this._toAnthropicMessages(messages).
    //   Note: Anthropic does NOT accept a system message inside the messages array.
    //   The system prompt is passed as a top-level "system" field in the request body.
    //
    // Step 2 — Build the request body:
    //   {
    //     model: this._model,
    //     max_tokens: 8096,
    //     messages: <anthropic messages>,
    //     tools: this._toolsSchemas,
    //     ...(this._systemPrompt ? { system: this._systemPrompt } : {}),
    //   }
    //
    // Step 3 — POST to this._endpoint with headers:
    //   { "x-api-key": this._apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" }
    //   If printRequest, log this._endpoint and the messages with JSON.stringify.
    //
    // Step 4 — Parse the response.
    //   On non-ok status throw: new Error(`HTTP ${response.status}: ${text}`)
    //   Extract data.content (array of blocks) and data.stop_reason.
    //   Log data with JSON.stringify when printRequest is true.
    //   Find the text block: content_blocks.find(b => b.type === "text")?.text
    //   Find tool_use blocks: content_blocks.filter(b => b.type === "tool_use")
    //   Build: new Message(Role.ASSISTANT, textContent, undefined, undefined,
    //            toolUseBlocks.length > 0 ? contentBlocks : undefined)
    //
    // Step 5 — Handle tool use.
    //   If data.stop_reason === "tool_use":
    //     a) Append the assistant Message to `messages` (mutate — same as Python).
    //     b) Call this._processToolCalls(toolUseBlocks) to get tool result Messages.
    //     c) Append all tool result Messages to `messages`.
    //     d) Recurse: return this.getResponse(messages, printRequest).
    //   Otherwise return the assistant Message directly.
    throw new Error("Not implemented — see TODO comments above");
  }

  private _toAnthropicMessages(
    messages: Message[],
  ): Array<Record<string, unknown>> {
    // TODO: Convert our internal Message list to the Anthropic messages format.
    //
    // The tricky part: Anthropic requires consecutive TOOL result messages to be
    // grouped into a SINGLE user message with a content array of tool_result blocks.
    //
    // Walk `messages` with an index `i` and build `result`:
    //
    //   if messages[i].role === Role.TOOL:
    //     Collect all consecutive TOOL messages into tool_results:
    //       [{ type: "tool_result", tool_use_id: msg.toolCallId, content: msg.content }, ...]
    //     Push { role: "user", content: tool_results } to result.
    //
    //   else if messages[i].role === Role.ASSISTANT:
    //     content = msg.toolCalls if msg.toolCalls else msg.content
    //     Push { role: "assistant", content } to result.
    //
    //   else (USER / SYSTEM):
    //     Push { role: msg.role, content: msg.content } to result.
    //
    // Return result.
    throw new Error("Not implemented — see TODO comments above");
  }

  private async _processToolCalls(
    toolUseBlocks: Array<Record<string, unknown>>,
  ): Promise<Message[]> {
    // TODO: Iterate over toolUseBlocks. Each block has shape:
    //   { type: "tool_use", id: string, name: string, input: Record<string, unknown> }
    //
    // For each block:
    //   1. Extract id (tool_use_id), name, input (already parsed — no JSON.parse needed).
    //   2. Call await this._callTool(name, input) to get the result string.
    //   3. Build: new Message(Role.TOOL, result, id, name)
    //   4. Log: `FUNCTION '${name}'\n${result}\n${'-'.repeat(50)}`
    //
    // Return the array of tool result Messages.
    throw new Error("Not implemented — see TODO comments above");
  }

  private async _callTool(
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    // TODO: Look up the tool by functionName in this._toolsDict.
    //   If found, call await tool.execute(args) and return the result.
    //   If not found, return `Unknown function: ${functionName}`.
    throw new Error("Not implemented — see TODO comments above");
  }
}
