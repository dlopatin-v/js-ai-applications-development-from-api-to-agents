import OpenAI from "openai";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { BaseTool } from "./tools/base.js";

export class T12Agent {
  private readonly toolsMap: Map<string, BaseTool>;
  private readonly toolsSchemas: object[];

  constructor(
    private readonly client: OpenAI,
    private readonly model: string,
    tools: BaseTool[],
  ) {
    this.toolsMap = new Map(tools.map((t) => [t.name, t]));
    this.toolsSchemas = tools.map((t) => t.schema);
    console.log(JSON.stringify(this.toolsSchemas, null, 4));
  }

  /**
   * Public entry point for a single conversational turn. Calls _chatCompletion and loops
   * until the model returns a response without tool calls.
   * @param messages - Full conversation history (mutated with tool results).
   * @param logMessages - Whether to log messages for debugging.
   * @returns The final assistant Message after all tool calls are resolved.
   */
  async chatCompletion(messages: Message[], logMessages = false): Promise<Message> {
    // TODO
  }

  /**
   * Makes a single Chat Completions API call and returns the assistant message.
   * @param messages - Current conversation history.
   * @param logMessages - Whether to log the request/response.
   * @returns The assistant Message (may contain tool_calls).
   * Hint: call client.chat.completions.create({ model, messages, tools: toolsSchemas });
   * construct a Message from the response, preserving tool_calls.
   */
  private async _chatCompletion(messages: Message[], logMessages = false): Promise<Message> {
    // TODO
  }

  /**
   * Executes all tool calls from the model response and returns the result messages.
   * @param toolCalls - Array of tool call objects from the assistant message.
   * @returns Array of TOOL Messages, one per tool call, with the stringified result.
   * Hint: look up each tool by name in toolsMap; call tool.execute(toolCallId, args);
   * run in parallel with Promise.all.
   */
  private async _dispatchToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ): Promise<Message[]> {
    // TODO
  }
}
