import OpenAI from "openai";
import { BaseTool } from "./tools/base";

import { Message, Role } from "../../commons";

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
    // TODO:
    // - Build a request with model, messages (serialised), and tool schemas
    // - Call this.client.chat.completions.create and get the first choice
    // - Create an assistant Message with empty content
    // - If choice.message.content is set, assign it to the assistant message
    // - If choice.message.tool_calls is set, serialise them into assistantMsg.tool_calls
    //   as a list of objects with keys: id, type, function (name + arguments)
    // - If finish_reason is "tool_calls":
    //   - Append assistantMsg to messages
    //   - Call _dispatchToolCalls() and extend messages with the resulting tool messages
    //   - Optionally log if logMessages
    //   - Recursively call _chatCompletion and return the result
    // - Optionally log if logMessages, then print the assistant reply with "🤖: " prefix
    // - Return the assistant message
    throw new Error("Not implemented");
  }

  private async _dispatchToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ): Promise<Message[]> {
    // TODO:
    // - Iterate over each tool call
    // - Look up the tool by function name in this.toolsMap
    // - If not found, set content to an error string
    // - Otherwise call tool.execute() with the tool call ID and parsed JSON arguments,
    //   then take the content from the resulting message
    // - Build a TOOL role Message (with tool_call_id, name, content) for each call
    // - Return the list of tool messages
    throw new Error("Not implemented");
  }
}
