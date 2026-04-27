import OpenAI from "openai";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { T11MCPClient, ToolSchema } from "./mcp_clients/_base.js";

interface ToolCallDelta {
  index: number;
  id?: string | null;
  type?: string | null;
  function?: { name?: string | null; arguments?: string };
}

export class AgentMCPAuth {
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly tools: ToolSchema[];
  private readonly mcpClient: T11MCPClient;

  constructor(options: {
    apiKey: string;
    model: string;
    tools: ToolSchema[];
    mcpClient: T11MCPClient;
  }) {
    this.openai = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model;
    this.tools = options.tools;
    this.mcpClient = options.mcpClient;
  }

  private _collectToolCalls(toolDeltas: ToolCallDelta[]): OpenAI.ChatCompletionMessageFunctionToolCall[] {
    const toolMap: Record<number, { id: string; type: string; function: { name: string; arguments: string } }> = {};

    for (const delta of toolDeltas) {
      const idx = delta.index;
      if (!toolMap[idx]) {
        toolMap[idx] = { id: "", type: "function", function: { name: "", arguments: "" } };
      }
      if (delta.id) toolMap[idx].id = delta.id;
      if (delta.type) toolMap[idx].type = delta.type;
      if (delta.function?.name) toolMap[idx].function.name = delta.function.name;
      if (delta.function?.arguments) toolMap[idx].function.arguments += delta.function.arguments;
    }

    return Object.values(toolMap) as OpenAI.ChatCompletionMessageFunctionToolCall[];
  }

  private async _streamResponse(messages: Message[]): Promise<Message<OpenAI.ChatCompletionMessageFunctionToolCall>> {
    const stream = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      tools: this.tools as OpenAI.ChatCompletionTool[],
      temperature: 0.0,
      stream: true,
    });

    let content = "";
    const toolDeltas: ToolCallDelta[] = [];

    process.stdout.write("🤖: ");

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        process.stdout.write(delta.content);
        content += delta.content;
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          toolDeltas.push(tc as ToolCallDelta);
        }
      }
    }

    console.log();

    return new Message(
      Role.ASSISTANT,
      content,
      undefined,
      undefined,
      toolDeltas.length > 0 ? this._collectToolCalls(toolDeltas) : []
    );
  }

  async getCompletion(messages: Message[]): Promise<Message> {
    const aiMessage = await this._streamResponse(messages);

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      messages.push(aiMessage);
      await this._callTools(aiMessage as Message<OpenAI.ChatCompletionMessageFunctionToolCall>, messages);
      return await this.getCompletion(messages);
    }

    return aiMessage;
  }

  private async _callTools(aiMessage: Message<OpenAI.ChatCompletionMessageFunctionToolCall>, messages: Message[]): Promise<void> {
    for (const toolCall of aiMessage.tool_calls ?? []) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      try {
        const toolResult = await this.mcpClient.callTool(toolName, toolArgs);
        messages.push(new Message(Role.TOOL, String(toolResult), toolCall.id));
      } catch (err) {
        const errorMsg = `Error: ${err}`;
        console.error(errorMsg);
        messages.push(new Message(Role.TOOL, errorMsg, toolCall.id));
      }
    }
  }
}
