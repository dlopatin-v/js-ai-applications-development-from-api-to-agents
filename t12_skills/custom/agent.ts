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

  async chatCompletion(messages: Message[], logMessages = false): Promise<Message> {
    // TODO
  }

  private async _chatCompletion(messages: Message[], logMessages = false): Promise<Message> {
    // TODO
  }

  private async _dispatchToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ): Promise<Message[]> {
    // TODO
  }
}
