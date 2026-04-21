import { BaseUserServiceTool } from "./base";

export class DeleteUserTool extends BaseUserServiceTool {
  get name() { return "delete_users"; }
  get description() { return "Deletes user from the system"; }
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
      return await this.userClient.deleteUser(Number(args["id"]));
    } catch (e: unknown) {
      return `Error while deleting user by id: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
}
