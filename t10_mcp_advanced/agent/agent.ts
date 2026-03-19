import OpenAI from "openai";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { MCPClient, ToolSchema } from "./clients/mcpClient.js";
import { CustomMCPClient } from "./clients/customMcpClient.js";

interface ToolCallDelta {
  index: number;
  id?: string | null;
  type?: string | null;
  function?: { name?: string | null; arguments?: string };
}

export class CustomAgentMCP {
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly tools: ToolSchema[];
  private readonly toolNameClientMap: Map<string, MCPClient | CustomMCPClient>;

  constructor(options: {
    apiKey: string;
    model: string;
    tools: ToolSchema[];
    toolNameClientMap: Map<string, MCPClient | CustomMCPClient>;
  }) {
    this.openai = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model;
    this.tools = options.tools;
    this.toolNameClientMap = options.toolNameClientMap;
  }

  /**
   * Merges streaming tool-call deltas into a complete list of tool calls.
   * @param toolDeltas - Array of partial tool-call chunks accumulated during streaming.
   * @returns A fully assembled array of ChatCompletionMessageToolCall objects.
   * Hint: use `index` to bucket deltas; concatenate `function.arguments` strings.
   */
  private _collectToolCalls(
    toolDeltas: ToolCallDelta[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] {
    // TODO
  }

  /**
   * Streams a chat completion and assembles the full assistant message.
   * @param messages - Conversation history to send to the model.
   * @returns A Message with Role.ASSISTANT, the accumulated text, and any tool calls.
   * Hint: use `openai.chat.completions.stream()`; collect content and tool-call deltas.
   */
  private async _streamResponse(messages: Message[]): Promise<Message> {
    // TODO
  }

  /**
   * Main entry point for a single conversational turn.
   * Streams a response; if the model wants to call tools, dispatches them and loops.
   * @param messages - Full conversation history (mutated in-place with tool results).
   * @returns The final assistant Message after all tool calls are resolved.
   */
  async getCompletion(messages: Message[]): Promise<Message> {
    // TODO
  }

  /**
   * Executes every tool call requested by the model and appends results to messages.
   * @param aiMessage - The assistant message containing tool_calls.
   * @param messages - Conversation history; TOOL messages are pushed here.
   * Hint: look up the correct MCP client via `toolNameClientMap`; stringify results.
   */
  private async _callTools(aiMessage: Message, messages: Message[]): Promise<void> {
    // TODO
  }
}
