import OpenAI from "openai";
import { Message } from "commons/models/message";
import { Role } from "commons/models/role";
import { BaseTool } from "./tools/base.js";
import { UMSDataGuardrail } from "./guardrail.js";

/** Serialise a Message into the OpenAI message param shape. */
function serializeMessage(msg: Message): OpenAI.ChatCompletionMessageParam {
  if (msg.role === Role.TOOL) {
    return {
      role: "tool",
      content: msg.content ?? "",
      tool_call_id: msg.tool_call_id ?? "",
    };
  }
  if (msg.role === Role.ASSISTANT) {
    return {
      role: "assistant",
      content: msg.content ?? null,
      ...(msg.tool_calls?.length && {
        tool_calls: msg.tool_calls as OpenAI.ChatCompletionMessageToolCall[],
      }),
    };
  }
  if (msg.role === Role.SYSTEM) {
    return { role: "system", content: msg.content ?? "" };
  }
  return { role: "user", content: msg.content ?? "" };
}

export class UMSAgent {
  private readonly _tools: Map<string, BaseTool>;
  private readonly _toolSchemas: OpenAI.ChatCompletionTool[];
  private readonly _model: string;
  private readonly _openai: OpenAI;
  private readonly _guardrail: UMSDataGuardrail;

  constructor(apiKey: string, model: string, tools: BaseTool[]) {
    this._tools = new Map(tools.map((t) => [t.name, t]));
    this._toolSchemas = tools.map((t) => t.schema as unknown as OpenAI.ChatCompletionTool);
    this._model = model;
    this._openai = new OpenAI({ apiKey });
    this._guardrail = new UMSDataGuardrail();
  }

  /**
   * Non-streaming completion with recursive tool-calling support.
   * Mutates `messages` in-place (appends assistant + tool messages).
   */
  async response(messages: Message[]): Promise<Message> {
    const completion = await this._openai.chat.completions.create({
      model: this._model,
      messages: messages.map(serializeMessage),
      tools: this._toolSchemas,
      stream: false,
    });

    const choice = completion.choices[0].message;
    const aiMessage = new Message<OpenAI.ChatCompletionMessageFunctionToolCall>(
      Role.ASSISTANT,
      choice.content ?? "",
      undefined,
      undefined,
      (choice.tool_calls ?? []) as OpenAI.ChatCompletionMessageFunctionToolCall[],
    );

    if (aiMessage.tool_calls?.length) {
      messages.push(aiMessage);
      await this._callTools(aiMessage, messages);
      return this.response(messages);
    }

    return aiMessage;
  }

  /**
   * Streaming completion with recursive tool-calling support.
   * Yields SSE-formatted string chunks for the frontend.
   * Mutates `messages` in-place.
   */
  async *streamResponse(messages: Message[]): AsyncGenerator<string> {
    const stream = await this._openai.chat.completions.create({
      model: this._model,
      messages: messages.map(serializeMessage),
      tools: this._toolSchemas,
      stream: true,
    });

    let contentBuffer = "";
    const toolDeltas: OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[] = [];

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        contentBuffer += delta.content;
        yield `data: ${JSON.stringify({
          choices: [{ delta: { content: delta.content }, index: 0, finish_reason: null }],
        })}\n\n`;
      }

      if (delta.tool_calls) {
        toolDeltas.push(...delta.tool_calls);
      }
    }

    if (toolDeltas.length > 0) {
      const toolCalls = this._collectToolCalls(toolDeltas);

      const aiMessage = new Message<typeof toolCalls[number]>(
        Role.ASSISTANT,
        contentBuffer,
        undefined,
        undefined,
        toolCalls,
      );
      messages.push(aiMessage);

      // Notify the frontend about each tool being called
      for (const tc of toolCalls) {
        let toolArgs: unknown = {};
        try { toolArgs = JSON.parse(tc.function.arguments); } catch { /* keep {} */ }
        yield `data: ${JSON.stringify({
          tool_activity: { type: "call", name: tc.function.name, arguments: toolArgs },
        })}\n\n`;
      }

      const prevLen = messages.length;
      await this._callTools(aiMessage, messages);

      // Notify the frontend about each tool result
      const resultMessages = messages.slice(prevLen);
      for (let i = 0; i < resultMessages.length; i++) {
        const name = toolCalls[i]?.function.name ?? "";
        yield `data: ${JSON.stringify({
          tool_activity: { type: "result", name, content: resultMessages[i].content },
        })}\n\n`;
      }

      // Recursively stream the follow-up response
      yield* this.streamResponse(messages);
      return;
    }

    // No tool calls — stream is complete
    messages.push(new Message(Role.ASSISTANT, contentBuffer));

    yield `data: ${JSON.stringify({
      choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
    })}\n\n`;
    yield "data: [DONE]\n\n";
  }

  /**
   * Merges streaming tool-call deltas (indexed) into complete tool call objects.
   */
  private _collectToolCalls(
    toolDeltas: OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[],
  ): Array<{ id: string; type: string; function: { name: string; arguments: string } }> {
    const byIndex = new Map<
      number,
      { id: string; type: string; function: { name: string; arguments: string } }
    >();

    for (const delta of toolDeltas) {
      const idx = delta.index;
      if (!byIndex.has(idx)) {
        byIndex.set(idx, { id: "", type: "function", function: { name: "", arguments: "" } });
      }
      const entry = byIndex.get(idx)!;
      if (delta.id) entry.id = delta.id;
      if (delta.type) entry.type = delta.type;
      if (delta.function?.name) entry.function.name = delta.function.name;
      if (delta.function?.arguments) entry.function.arguments += delta.function.arguments;
    }

    // Return in index order
    return Array.from(byIndex.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v);
  }

  /**
   * Executes each tool call in `aiMessage`, applies the guardrail, and appends
   * the resulting tool messages to `messages`.
   */
  private async _callTools(aiMessage: Message, messages: Message[]): Promise<void> {
    const toolCalls = aiMessage.tool_calls as Array<{
      id: string;
      function: { name: string; arguments: string };
    }> | undefined;

    if (!toolCalls?.length) return;

    for (const tc of toolCalls) {
      const toolName = tc.function.name;
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(tc.function.arguments); } catch { /* keep {} */ }

      const tool = this._tools.get(toolName);
      if (tool) {
        const toolMessage = await tool.execute(tc.id, args);
        toolMessage.content = this._guardrail.redact(toolMessage.content);
        messages.push(toolMessage);
      } else {
        messages.push(
          new Message(
            Role.TOOL,
            `Error: Unable to call ${toolName}. Tool not found.`,
            tc.id,
          ),
        );
      }
    }
  }
}
