import { Message } from "../../../commons/models/message.js";
import { Role } from "../../../commons/models/role.js";

export abstract class BaseTool {
  async execute(toolCallId: string, args: Record<string, unknown>): Promise<Message> {
    let content: string;
    try {
      content = await this._execute(args);
    } catch (e: unknown) {
      content = `ERROR during tool call execution:\n ${(e as Error).message}`;
    }
    return new Message(Role.TOOL, content, toolCallId);
  }

  protected abstract _execute(args: Record<string, unknown>): Promise<string>;

  abstract get name(): string;
  abstract get description(): string;
  abstract get parameters(): Record<string, unknown>;

  get schema(): object {
    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters,
      },
    };
  }
}
