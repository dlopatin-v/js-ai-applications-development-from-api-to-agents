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
    // TODO:
    // 1. If logMessages, print "\n--- REQUEST ---" and JSON.stringify the serialised messages (indent 2)
    // 2. Return await this._chatCompletion(messages, logMessages)
    throw new Error("Not implemented");
  }

  private async _chatCompletion(messages: Message[], logMessages = false): Promise<Message> {
    // TODO:
    // 1. Build `request` with model, messages serialised to plain objects, and this.toolsSchemas as tools
    // 2. Call `this.client.chat.completions.create(request)` and get `choice = response.choices[0]`
    // 3. Create `assistantMsg = new Message(Role.ASSISTANT, "")`
    // 4. If `choice.message.content` is set, assign it to `assistantMsg.content`
    // 5. If `choice.message.tool_calls` is set, build and assign `assistantMsg.tool_calls` as:
    //    [{ id, type, function: { name, arguments } }] for each tool call
    // 6. If `choice.finish_reason === "tool_calls"`:
    //       a. Push `assistantMsg` onto `messages`
    //       b. Call `await this._dispatchToolCalls(choice.message.tool_calls!)`, assign to `toolMessages`
    //       c. Push all toolMessages onto messages
    //       d. If logMessages, print the serialised assistantMsg and toolMessages
    //       e. Return `await this._chatCompletion(messages, logMessages)`
    // 7. If logMessages, print "---------------\n"
    // 8. Print `🤖: ${assistantMsg.content}`
    // 9. Return assistantMsg
    throw new Error("Not implemented");
  }

  private async _dispatchToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ): Promise<Message[]> {
    // TODO:
    // 1. Initialize `toolMessages: Message[] = []`
    // 2. For each `tc` in toolCalls:
    //       a. Look up `tool = this.toolsMap.get(tc.function.name)`
    //       b. If not found, set `content = "ERROR: unknown tool '${tc.function.name}'"`
    //       c. Else call `await tool.execute(tc.id, JSON.parse(tc.function.arguments))`,
    //          assign to `resultMsg`, set `content = resultMsg.content`
    //       d. Push `new Message(Role.TOOL, content, tc.id, tc.function.name)` to toolMessages
    // 3. Return toolMessages
    throw new Error("Not implemented");
  }
}
