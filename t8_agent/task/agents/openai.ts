import OpenAI from "openai";

import { BaseAgent } from "./_base";
import { BaseTool } from "../tools/base";

import { OPENAI_CHAT_COMPLETIONS_ENDPOINT } from "../../../commons/constants.js";
import { Message } from "../../../commons/models/message.js";
import { Role } from "../../../commons/models/role.js";

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

  async getResponse(messages: Message<OpenAI.ChatCompletionMessageFunctionToolCall>[], printRequest = true): Promise<Message<OpenAI.ChatCompletionMessageFunctionToolCall>> {
    const headers = {
      "Authorization": `Bearer ${this._apiKey}`,
      "Content-Type": "application/json"
    };

    const requestMessages = [
      ...(this._systemPrompt ? [new Message(Role.SYSTEM, this._systemPrompt)] : []),
      ...messages,
    ];

    const serializedMessages = requestMessages.map((msg) => {
      const base: Record<string, unknown> = { role: msg.role, content: msg.content };
      if (msg.role === Role.TOOL) {
        base.tool_call_id = msg.tool_call_id;
        base.name = msg.name;
      }
      if (msg.role === Role.ASSISTANT && msg.tool_calls) {
        base.tool_calls = msg.tool_calls;
      }
      return base;
    });

    const requestData = {
      model: this._model,
      messages: serializedMessages,
      tools: this._toolsSchemas,
    };

    if (printRequest) {
      console.log(this._endpoint);
      console.log(`REQUEST:\n${JSON.stringify({ messages: serializedMessages }, null, 2)}`);
    }

    const response = await fetch(this._endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      const data = await response.json() as any;

      const choice = data.choices[0];
      const messageData = choice.message;

      console.log(`RESPONSE: ${JSON.stringify({ choice }, null, 2)}`);
      console.log("-".repeat(100));

      const content = messageData.content;
      const toolCalls = messageData.tool_calls;

      const aiResponse = new Message<OpenAI.ChatCompletionMessageFunctionToolCall>(Role.ASSISTANT, content, undefined, undefined, toolCalls);

      if (choice.finish_reason === "tool_calls") {
        messages.push(aiResponse);
        const toolMessages = await this._processToolCalls(toolCalls);
        messages.push(...toolMessages);

        return this.getResponse(messages, printRequest);
      }

      return aiResponse;
    }

    throw new Error(`HTTP ${response.status}: ${response.text}`);
  }

  private async _processToolCalls(
    toolCalls: OpenAI.ChatCompletionMessageFunctionToolCall[],
  ): Promise<Message<OpenAI.ChatCompletionMessageFunctionToolCall>[]> {
    return await Promise.all(toolCalls.map(async (toolCall) => {
      const toolCallId = toolCall.id;
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;

      const result = await this._callTool(functionName, args);
      console.log(`FUNCTION '${functionName}'\n${result}\n${'-'.repeat(50)}`);
      return new Message(Role.TOOL, result, toolCallId, functionName);
    }));
  }

  private async _callTool(
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    const tool = this._toolsDict[functionName];
    if (tool) {
      return await tool.execute(args);
    } else {
      return `Unknown function: ${functionName}`;
    }
  }
}
