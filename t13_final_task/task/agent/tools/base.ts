import { Message } from "commons/models/message";
import { Role } from "commons/models/role";

export abstract class BaseTool {
  abstract get name(): string;
  abstract get description(): string;
  abstract get parameters(): Record<string, unknown>;

  get schema(): Record<string, unknown> {
    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters,
      },
    };
  }

  async execute(toolCallId: string, arguments_: Record<string, unknown>): Promise<Message> {
    let content: string;
    try {
      content = await this._execute(arguments_);
    } catch (e) {
      content = `ERROR during tool call execution:\n ${e}`;
    }
    return new Message(Role.TOOL, content, toolCallId);
  }

  protected abstract _execute(arguments_: Record<string, unknown>): Promise<string>;
}
