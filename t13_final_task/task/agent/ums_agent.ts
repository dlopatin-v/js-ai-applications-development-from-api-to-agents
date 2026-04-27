import OpenAI from "openai";

import { UMSDataGuardrail } from "./guardrail.js";
import { BaseTool } from "./tools/base.js";

import { Message } from "../../../commons/models/message.js";
import { Role } from "../../../commons/models/role.js";

/** Serialise a Message into the OpenAI message param shape. */
function serializeMessage(msg: Message): OpenAI.ChatCompletionMessageParam {
  // TODO:
  // Return the correct OpenAI message param shape based on msg.role:
  //   - TOOL: { role, content, tool_call_id }
  //   - ASSISTANT: { role, content, tool_calls (if present) }
  //   - SYSTEM: { role, content }
  //   - Default (USER): { role, content }
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
    // - Store tools as a Map of tool.name → tool in this._tools
    // - Store tool schemas list in this._toolSchemas
    // - Store model in this._model
    // - Init OpenAI client with apiKey
    // - Init UMSDataGuardrail
    throw new Error("Not implemented");
  }

  /**
   * Non-streaming completion with recursive tool-calling support.
   * Mutates `messages` in-place (appends assistant + tool messages).
   */
  async response(messages: Message[]): Promise<Message> {
    // TODO:
    // 1. Build request: model, messages (each serialized), toolSchemas, stream=false
    // 2. Call chat.completions.create and build ai_message (Role.ASSISTANT) from response
    // 3. If ai_message has tool_calls: append to messages, call _callTools(), then recurse
    // 4. Return ai_message
    throw new Error("Not implemented");
  }

  /**
   * Streaming completion with recursive tool-calling support.
   * Yields SSE-formatted string chunks for the frontend.
   * Mutates `messages` in-place.
   */
  async *streamResponse(messages: Message[]): AsyncGenerator<string> {
    // TODO:
    // 1. Stream chat.completions.create; buffer content and collect tool_call deltas
    // 2. Yield SSE chunks for each content delta
    // 3. If tool_deltas after stream:
    //    - Collect tool calls via _collectToolCalls(), build ai_message, append to messages
    //    - Notify frontend about each tool call (type: "call") and result (type: "result") via SSE
    //    - Recursively yield* streamResponse(messages), then return
    // 4. If no tool calls: append final assistant message
    // 5. Yield final SSE chunk with finish_reason="stop", then yield "data: [DONE]\n\n"
    throw new Error("Not implemented");
  }

  /** Convert streaming tool-call deltas to complete tool call objects. */
  private _collectToolCalls(
    toolDeltas: OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[],
  ): Array<{ id: string; type: string; function: { name: string; arguments: string } }> {
    // TODO:
    // - Use a Map keyed by delta.index; accumulate id, type, function.name, function.arguments
    // - Return entries sorted by index
    throw new Error("Not implemented");
  }

  /**
   * Executes each tool call in `aiMessage`, applies the guardrail, and appends
   * the resulting tool messages to `messages`.
   */
  private async _callTools(aiMessage: Message, messages: Message[]): Promise<void> {
    // TODO:
    // Iterate through tool_calls:
    //   - Extract tool_name and parse arguments
    //   - If tool found in this._tools: execute it, apply guardrail.redact(), append tool message
    //   - If tool not found: append a TOOL error message
    throw new Error("Not implemented");
  }
}
