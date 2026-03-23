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
    if (logMessages) {
      console.log("\n--- REQUEST ---");
      console.log(JSON.stringify(messages, null, 2));
    }
    return this._chatCompletion(messages, logMessages);
  }

  private async _chatCompletion(messages: Message[], logMessages = false): Promise<Message> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: this.toolsSchemas as any,
    });

    const choice = response.choices[0];
    const assistantMsg = new Message(Role.ASSISTANT, "");

    if (choice.message.content) {
      assistantMsg.content = choice.message.content;
    }
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      assistantMsg.tool_calls = choice.message.tool_calls.map((tc) => ({
        id: tc.id,
        type: tc.type,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      }));
    }

    if (choice.finish_reason === "tool_calls") {
      messages.push(assistantMsg);
      const toolMessages = await this._dispatchToolCalls(choice.message.tool_calls!);
      messages.push(...toolMessages);

      if (logMessages) {
        console.log(JSON.stringify(assistantMsg, null, 2));
        console.log(JSON.stringify(toolMessages, null, 2));
      }
      return this._chatCompletion(messages, logMessages);
    }

    if (logMessages) {
      console.log("---------------\n");
    }

    console.log(`🤖: ${assistantMsg.content}`);
    return assistantMsg;
  }

  private async _dispatchToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ): Promise<Message[]> {
    const toolMessages: Message[] = [];
    for (const tc of toolCalls) {
      const tool = this.toolsMap.get(tc.function.name);
      let content: string;
      if (!tool) {
        content = `ERROR: unknown tool '${tc.function.name}'`;
        toolMessages.push(new Message(Role.TOOL, content, tc.id, tc.function.name));
      } else {
        const resultMsg = await tool.execute(tc.id, JSON.parse(tc.function.arguments));
        toolMessages.push(resultMsg);
      }
    }
    return toolMessages;
  }
}
