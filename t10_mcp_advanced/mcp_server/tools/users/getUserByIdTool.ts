import { BaseUserServiceTool } from "./base.js";

export class GetUserByIdTool extends BaseUserServiceTool {
  get name(): string {
    return "get_user_by_id";
  }

  get description(): string {
    return "Provides full user information by user_id";
  }

  get inputSchema(): Record<string, any> {
    return {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "User ID",
        },
      },
      required: ["id"],
    };
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    const userId = String(arguments_["id"]);
    return this.userClient.getUser(userId);
  }
}
