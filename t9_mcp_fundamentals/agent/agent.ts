import OpenAI from "openai";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { MCPClient, ToolSchema } from "./mcp_clients/base.js";

interface ToolCallDelta {
  index: number;
  id?: string | null;
  type?: string | null;
  function?: { name?: string | null; arguments?: string };
}

type OpenAIToolCall = OpenAI.Chat.Completions.ChatCompletionMessageToolCall;
type OpenAIFunctionToolCall = Extract<OpenAIToolCall, { type: "function" }>;

export class AgentMCPFundamentals {
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly tools: ToolSchema[];
  private readonly mcpClient: MCPClient;

  constructor(options: {
    apiKey: string;
    model: string;
    tools: ToolSchema[];
    mcpClient: MCPClient;
  }) {
    this.openai = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model;
    this.tools = options.tools;
    this.mcpClient = options.mcpClient;
  }

  private _collectToolCalls(toolDeltas: ToolCallDelta[]): OpenAIFunctionToolCall[] {
    return Object.values(
      toolDeltas.reduce<Record<number, { id: string; type: string; function: { name: string; arguments: string } }>>(
        (toolMap, delta) => {
          const currentToolCall = toolMap[delta.index] ?? {
            id: "",
            type: "function",
            function: { name: "", arguments: "" },
          };

          if (delta.id) currentToolCall.id = delta.id;
          if (delta.type) currentToolCall.type = delta.type;
          if (delta.function?.name) currentToolCall.function.name = delta.function.name;
          if (delta.function?.arguments) currentToolCall.function.arguments += delta.function.arguments;

          toolMap[delta.index] = currentToolCall;
          return toolMap;
        },
        {}
      )
    ) as OpenAIFunctionToolCall[];
  }

  private async _streamResponse(messages: Message[]): Promise<Message> {
    const stream = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages as any,
      tools: this.tools as OpenAI.Chat.Completions.ChatCompletionTool[],
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

    return new Message(
      Role.ASSISTANT,
      content,
      undefined,
      undefined,
      toolDeltas.length > 0 ? this._collectToolCalls(toolDeltas) : [] as any
    );
  }

  async getCompletion(messages: Message[]): Promise<Message> {
    const aiMessage = await this._streamResponse(messages);

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      messages.push(aiMessage);
      await this._callTools(aiMessage, messages);
      return await this.getCompletion(messages);
    }

    return aiMessage;
  }

  private async _callTools(aiMessage: Message, messages: Message[]): Promise<void> {
    // TODO:
    // 1. Iterate through aiMessage.tool_calls
    // 2. Extract tool name and tool arguments (arguments is JSON — parse it)
    // 3. Wrap in try/catch: call this.mcpClient.callTool(toolName, toolArgs)
    //    - On success: push new Message(Role.TOOL, String(toolResult), toolCall.id)
    //    - On error:   push new Message(Role.TOOL, `Error: ${err}`, toolCall.id)
    throw new Error("Not implemented");
  }
}
