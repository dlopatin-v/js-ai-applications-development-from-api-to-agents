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

  /**
   * Deletes a user from the User Service by their numeric ID.
   * @param arguments_ - Object with an `id` field (number) identifying the user to delete.
   * @returns A string with the API response confirming deletion.
   * Hint: call this.userClient.deleteUser(arguments_.id).
   */
  async execute(arguments_: Record<string, any>): Promise<string> {
    // TODO
  }
}
