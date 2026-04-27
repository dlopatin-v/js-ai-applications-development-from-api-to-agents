import OpenAI from "openai";

import { BaseAgent } from "./_base";
import { BaseTool } from "../tools/base";

import { OPENAI_CHAT_COMPLETIONS_ENDPOINT, Message, Role } from "../../../commons";

export class OpenAIBasedAgent extends BaseAgent {
  private readonly _toolsSchemas: Record<string, unknown>[];
  private readonly _endpoint: string;

  constructor(
    model: string,
    apiKey: string,
    tools: BaseTool[] = [],
    systemPrompt?: string,
  ) {
    super(model, apiKey, tools, systemPrompt);
    this._toolsSchemas = tools.map((t) => t.openaiSchema);
    this._endpoint = OPENAI_CHAT_COMPLETIONS_ENDPOINT;

    console.log(this._endpoint);
    console.log(JSON.stringify(this._toolsSchemas, null, 4));
  }

  async getResponse(messages: Message[], printRequest = true): Promise<Message> {
    // TODO: Implement the OpenAI tool-calling agentic loop.
    //
    // Step 1 — Build the request message list for this API call only.
    //   Prepend a system Message (Role.SYSTEM, this._systemPrompt) to a copy
    //   of `messages` if this._systemPrompt is set. Never mutate the caller's array.
    //
    // Step 2 — Serialize messages for the API.
    //   Each Message must become a plain object. Use a helper or inline logic:
    //     { role: msg.role, content: msg.content }
    //   For TOOL messages also include: tool_call_id and name.
    //   For ASSISTANT messages with tool_calls also include: tool_calls (the raw array).
    //
    // Step 3 — POST to this._endpoint with:
    //   Headers: { Authorization: `Bearer ${this._apiKey}`, Content-Type: application/json }
    //   Body:    { model: this._model, messages: <serialized>, tools: this._toolsSchemas }
    //   If printRequest, log this._endpoint and the request messages with JSON.stringify.
    //
    // Step 4 — Parse the response.
    //   On non-ok status throw: new Error(`HTTP ${response.status}: ${text}`)
    //   Extract choices[0].message: { content, tool_calls }
    //   Log the choice with JSON.stringify when printRequest is true.
    //   Build: new Message(Role.ASSISTANT, content, undefined, undefined, tool_calls)
    //
    // Step 5 — Handle tool calls.
    //   If choices[0].finish_reason === "tool_calls":
    //     a) Append the assistant Message to `messages` (mutate — same as Python).
    //     b) Call this._processToolCalls(tool_calls) to get tool result Messages.
    //     c) Append all tool result Messages to `messages`.
    //     d) Recurse: return this.getResponse(messages, printRequest).
    //   Otherwise return the assistant Message directly.
    throw new Error("Not implemented — see TODO comments above");
  }

  private async _processToolCalls(
    toolCalls: Array<Record<string, unknown>>,
  ): Promise<Message[]> {
    // TODO: Iterate over toolCalls. Each entry has shape:
    //   { id: string, function: { name: string, arguments: string (JSON) } }
    //
    // For each tool call:
    //   1. Extract tool_call_id, function.name, JSON.parse(function.arguments).
    //   2. Call this._callTool(name, parsedArgs) to get the result string.
    //   3. Build: new Message(Role.TOOL, result, toolCallId, functionName)
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
