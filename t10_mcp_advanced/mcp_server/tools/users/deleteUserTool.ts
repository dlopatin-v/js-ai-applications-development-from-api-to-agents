import { BaseUserServiceTool } from "./base.js";

export class DeleteUserTool extends BaseUserServiceTool {
  get name(): string {
    return "delete_user";
  }

  get description(): string {
    return "Deletes user by user_id";
  }

  get inputSchema(): Record<string, any> {
    return {
      type: "object",
      properties: {
        id: { type: "number", description: "User ID" },
      },
      required: ["id"],
    };
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    const userId = String(arguments_["id"]);
    return this.userClient.deleteUser(userId);
  }
}
