import { BaseUserServiceTool } from "./base";

export class GetUserByIdTool extends BaseUserServiceTool {
  get name() { return "get_user_by_id"; }
  get description() { return "Provides full user information"; }
  get inputSchema() {
    return {
      type: "object",
      properties: {
        id: { type: "number", description: "User ID" },
      },
      required: ["id"],
    };
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    try {
      return await this.userClient.getUser(String(args["id"]));
    } catch (e: any) {
      return `Error while retrieving user by id: ${e.message}`;
    }
  }
}
