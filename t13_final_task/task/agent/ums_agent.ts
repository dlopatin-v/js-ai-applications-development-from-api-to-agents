import OpenAI from "openai";

import { UMSDataGuardrail } from "./guardrail";
import { BaseTool } from "./tools/base";

import { Message, Role } from "../../../commons";

/** Serialise a Message into the OpenAI message param shape. */
function serializeMessage(msg: Message): OpenAI.ChatCompletionMessageParam {
  // TODO:
  // 1. If `msg.role === Role.TOOL`, return: `{ role: "tool", content: msg.content ?? "", tool_call_id: msg.tool_call_id ?? "" }`
  // 2. If `msg.role === Role.ASSISTANT`, return: `{ role: "assistant", content: msg.content ?? null, ...spread tool_calls if present }`
  //    (use `...(msg.tool_calls?.length && { tool_calls: msg.tool_calls as OpenAI.ChatCompletionMessageToolCall[] })`)
  // 3. If `msg.role === Role.SYSTEM`, return: `{ role: "system", content: msg.content ?? "" }`
  // 4. Default: return `{ role: "user", content: msg.content ?? "" }`
  throw new Error("Not implemented");
}

export class UMSAgent {
  private readonly _tools: Map<string, BaseTool>;
  private readonly _toolSchemas: OpenAI.ChatCompletionTool[];
  private readonly _model: string;
  private readonly _openai: OpenAI;
  private readonly _guardrail: UMSDataGuardrail;

  constructor(apiKey: string, model: string, tools: BaseTool[]) {
    // TODO:
    // 1. Store tools as a Map: `new Map(tools.map((t) => [t.name, t]))` in `this._tools`
    // 2. Store tool schemas list: `tools.map((t) => t.schema as unknown as OpenAI.ChatCompletionTool)` in `this._toolSchemas`
    // 3. Store `model` in `this._model`
    // 4. Init `this._openai = new OpenAI({ apiKey })`
    // 5. Init `this._guardrail = new UMSDataGuardrail()`
    throw new Error("Not implemented");
  }

  /**
   * Non-streaming completion with recursive tool-calling support.
   * Mutates `messages` in-place (appends assistant + tool messages).
   */
  async response(messages: Message[]): Promise<Message> {
    // TODO:
    // 1. Call `await this._openai.chat.completions.create({ model: this._model, messages: messages.map(serializeMessage), tools: this._toolSchemas, stream: false })`
    // 2. Get `choice = completion.choices[0].message`
    // 3. Build `aiMessage = new Message(Role.ASSISTANT, choice.content ?? "", undefined, undefined, (choice.tool_calls ?? []) as ...)`
    // 4. If `aiMessage.tool_calls?.length`: push `aiMessage` to `messages`, `await this._callTools(aiMessage, messages)`,
    //    then `return this.response(messages)` (recursive call)
    // 5. Return `aiMessage`
    throw new Error("Not implemented");
  }

  /**
   * Streaming completion with recursive tool-calling support.
   * Yields SSE-formatted string chunks for the frontend.
   * Mutates `messages` in-place.
   */
  async *streamResponse(messages: Message[]): AsyncGenerator<string> {
    // TODO:
    // 1. Call `await this._openai.chat.completions.create({ model, messages: messages.map(serializeMessage), tools: this._toolSchemas, stream: true })`
    // 2. Init `contentBuffer = ""` and `toolDeltas: OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[] = []`
    // 3. `async for` each `chunk` in the stream; get `delta = chunk.choices[0]?.delta`; skip if no delta
    //    - If `delta.content`: append to `contentBuffer`, yield SSE chunk:
    //      `{ choices: [{ delta: { content: delta.content }, index: 0, finish_reason: null }] }`
    //    - If `delta.tool_calls`: push all into `toolDeltas`
    // 4. After the loop, if `toolDeltas.length > 0`:
    //    a. Call `this._collectToolCalls(toolDeltas)` to get `toolCalls`
    //    b. Build `aiMessage = new Message(Role.ASSISTANT, contentBuffer, undefined, undefined, toolCalls)` and push to `messages`
    //    c. For each `tc` in `toolCalls`: parse args (try `JSON.parse(tc.function.arguments)`, default `{}`),
    //       yield SSE chunk: `{ tool_activity: { type: "call", name: tc.function.name, arguments: toolArgs } }`
    //    d. `prevLen = messages.length`, then `await this._callTools(aiMessage, messages)`
    //    e. For each new message `messages[prevLen:]` (with index `i`): yield SSE chunk:
    //       `{ tool_activity: { type: "result", name: toolCalls[i]?.function.name ?? "", content: msg.content } }`
    //    f. `yield* this.streamResponse(messages)` recursively, then `return`
    // 5. If no tool calls: push `new Message(Role.ASSISTANT, contentBuffer)` to `messages`
    // 6. Yield the final stop chunk: `{ choices: [{ delta: {}, index: 0, finish_reason: "stop" }] }`
    // 7. Yield `"data: [DONE]\n\n"`
    throw new Error("Not implemented");
  }

  /** Convert streaming tool-call deltas to complete tool call objects. */
  private _collectToolCalls(
    toolDeltas: OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[],
  ): Array<{ id: string; type: string; function: { name: string; arguments: string } }> {
    // TODO:
    // 1. Create `byIndex = new Map<number, { id: string; type: string; function: { name: string; arguments: string } }>()`
    // 2. For each `delta` in `toolDeltas`:
    //    - `idx = delta.index`
    //    - If `!byIndex.has(idx)`: set default `{ id: "", type: "function", function: { name: "", arguments: "" } }`
    //    - Get `entry = byIndex.get(idx)!`
    //    - If `delta.id`: set `entry.id = delta.id`
    //    - If `delta.type`: set `entry.type = delta.type`
    //    - If `delta.function?.name`: set `entry.function.name = delta.function.name`
    //    - If `delta.function?.arguments`: append `entry.function.arguments += delta.function.arguments`
    // 3. Return entries sorted by index: `Array.from(byIndex.entries()).sort(([a], [b]) => a - b).map(([, v]) => v)`
    throw new Error("Not implemented");
  }

  /**
   * Executes each tool call in `aiMessage`, applies the guardrail, and appends
   * the resulting tool messages to `messages`.
   */
  private async _callTools(aiMessage: Message, messages: Message[]): Promise<void> {
    // TODO:
    // 1. Cast `aiMessage.tool_calls` as `Array<{ id: string; function: { name: string; arguments: string } }> | undefined`
    // 2. Return early if no tool calls
    // 3. For each `tc` in tool calls:
    //    a. `toolName = tc.function.name`
    //    b. Parse `args` from `tc.function.arguments` with `JSON.parse` (catch errors, default to `{}`)
    //    c. If tool found in `this._tools`:
    //       - `toolMessage = await tool.execute(tc.id, args)`
    //       - Push `toolMessage` to `messages`
    //    d. If tool NOT found: push `new Message(Role.TOOL, "Error: Unable to call <toolName>. Tool not found.", tc.id)`
    throw new Error("Not implemented");

    // TODO 2:
    // Implement ONLY after you started the app
    // Make PII filtering for the tool call result with `this._guardrail.redact(toolMessage.content)`
  }
}
