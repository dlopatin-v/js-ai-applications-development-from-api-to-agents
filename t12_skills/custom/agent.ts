import OpenAI from "openai";
import { Message } from "commons/models/message";
import { Role } from "commons/models/role";
import { BaseTool } from "./tools/base.js";

export class T12Agent {
  private readonly toolsMap: Map<string, BaseTool<OpenAI.ChatCompletionTool>>;
  private readonly toolsSchemas: OpenAI.ChatCompletionTool[];

  constructor(
    private readonly client: OpenAI,
    private readonly model: string,
    tools: BaseTool<OpenAI.ChatCompletionTool>[],
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
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      tools: this.toolsSchemas,
    });

    const choice = response.choices[0];
    const assistantMsg = new Message(Role.ASSISTANT, "");

    if (choice.message.content) {
      assistantMsg.content = choice.message.content;
    }
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCalls = choice.message.tool_calls as OpenAI.ChatCompletionMessageFunctionToolCall[];

      assistantMsg.tool_calls = toolCalls.map((toolCall) => ({
        id: toolCall.id,
        type: toolCall.type,
        function: { name: toolCall.function.name, arguments: toolCall.function.arguments },
      }));
    }

    if (choice.finish_reason === "tool_calls") {
      messages.push(assistantMsg);
      const toolMessages = await this._dispatchToolCalls(choice.message.tool_calls as OpenAI.ChatCompletionMessageFunctionToolCall[]);
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
    toolCalls: OpenAI.ChatCompletionMessageFunctionToolCall[],
  ): Promise<Message[]> {
    const toolMessages: Message[] = [];
    for (const toolCall of toolCalls) {
      const tool = this.toolsMap.get(toolCall.function.name);
      let content: string;
      if (!tool) {
        content = `ERROR: unknown tool '${toolCall.function.name}'`;
        toolMessages.push(new Message(Role.TOOL, content, toolCall.id, toolCall.function.name));
      } else {
        const resultMsg = await tool.execute(toolCall.id, JSON.parse(toolCall.function.arguments));
        toolMessages.push(resultMsg);
      }
    }
    return toolMessages;
  }
}
