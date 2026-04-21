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
      return await this.userClient.getUser(Number(args["id"]));
    } catch (e: unknown) {
      return `Error while retrieving user by id: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
}
