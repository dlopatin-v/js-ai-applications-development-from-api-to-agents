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

  private _collectToolCalls(
    toolDeltas: ToolCallDelta[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] {
    // TODO
  }

  private async _streamResponse(messages: Message[]): Promise<Message> {
    // TODO
  }

  async getCompletion(messages: Message[]): Promise<Message> {
    // TODO
  }

  private async _callTools(aiMessage: Message, messages: Message[]): Promise<void> {
    // TODO
  }
}
