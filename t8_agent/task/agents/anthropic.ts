import Anthropic, { ParsedMessage } from "@anthropic-ai/sdk";

import { ANTHROPIC_ENDPOINT } from "commons/constants";
import { Message } from "commons/models/message";
import { Role } from "commons/models/role";
import { BaseTool } from "../tools/base";
import { BaseAgent } from "./_base";

export class AnthropicBasedAgent extends BaseAgent {
  private readonly _toolsSchemas: Record<string, unknown>[];
  private readonly _endpoint: string;

  constructor(
    model: string,
    apiKey: string,
    tools: BaseTool[] = [],
    systemPrompt?: string,
  ) {
    super(model, apiKey, tools, systemPrompt);
    this._toolsSchemas = tools.map((t) => t.anthropicSchema);
    this._endpoint = ANTHROPIC_ENDPOINT;

    console.log(this._endpoint);
    console.log(JSON.stringify(this._toolsSchemas, null, 4));
  }

  async getResponse(messages: Message<Anthropic.ToolUseBlock>[], printRequest = true): Promise<Message<Anthropic.ToolUseBlock>> {
    const headers = {
      "x-api-key": this._apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    };

    const anthropicMessages = this._toAnthropicMessages(messages);
    const requestData = {
      model: this._model,
      max_tokens: 8096,
      messages: anthropicMessages,
      tools: this._toolsSchemas,
      ...(this._systemPrompt ? { system: this._systemPrompt } : {}),
    };

    if (printRequest) {
      console.log(this._endpoint);
      console.log(`REQUEST:\n${JSON.stringify({ messages: anthropicMessages }, null, 2)}`);
    }

    const response = await fetch(this._endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      const data = await response.json() as ParsedMessage<any>;

      const contentBlocks = data.content;
      const stopReason = data.stop_reason;

      console.log(`RESPONSE: ${JSON.stringify({ data }, null, 2)}`);
      console.log("-".repeat(100));

      const textContent = (contentBlocks.find(({ type }) => type === "text") as Anthropic.TextBlock | undefined)?.text ?? '';
      const toolUseBlocks = contentBlocks.filter(({ type }) => (type === "tool_use"))  as Anthropic.ToolUseBlock[];

      const aiResponse = new Message<Anthropic.ToolUseBlock>(Role.ASSISTANT, textContent, undefined, undefined, toolUseBlocks.length ? toolUseBlocks : undefined);

      if (stopReason === "tool_use") {
        messages.push(aiResponse);
        const toolMessages = await this._processToolCalls(toolUseBlocks);
        messages.push(...toolMessages);

        return this.getResponse(messages, printRequest);
      }

      return aiResponse;
    }

    throw new Error(`HTTP ${response.status}: ${response.text}`);
  }

  private _toAnthropicMessages(
    messages: Message<Anthropic.ToolUseBlock>[],
  ): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = [];
    let i = 0;

    while (i < messages.length) {
      const msg = messages[i];

      if (msg.role === Role.TOOL) {
        const toolGroup: Message<Anthropic.ToolUseBlock>[] = [];
        while (i < messages.length && messages[i].role === Role.TOOL) {
          toolGroup.push(messages[i]);
          i += 1;
        }

        result.push({
          role: Role.USER,
          content: toolGroup.map((toolMsg) => ({
            type: "tool_result",
            tool_use_id: toolMsg.tool_call_id,
            content: toolMsg.content,
          })),
        });
        continue;
      }

      if (msg.role === Role.ASSISTANT) {
        const content = msg.tool_calls?.length ? msg.tool_calls : msg.content;
        result.push({ role: Role.ASSISTANT, content });
        i += 1;
        continue;
      }

      result.push({ role: msg.role, content: msg.content });
      i += 1;
    }

    return result;
  }

  private async _processToolCalls(
    toolUseBlocks: Anthropic.ToolUseBlock[],
  ): Promise<Message<Anthropic.ToolUseBlock>[]> {
    return await Promise.all(toolUseBlocks.map(async (block) => {
      const name = block.name as string;
      const input = block.input as Record<string, unknown>;
      const result = await this._callTool(name, input);
      console.log(`FUNCTION '${name}'\n${result}\n${'-'.repeat(50)}`);
      return new Message(Role.TOOL, result, block.id as string, name) as Message<Anthropic.ToolUseBlock>;
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
