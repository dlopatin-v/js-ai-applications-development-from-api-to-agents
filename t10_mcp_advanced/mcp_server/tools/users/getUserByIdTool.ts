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

  /**
   * Fetches a single user record from the User Service by their numeric ID.
   * @param arguments_ - Object with an `id` field (number) for the user to retrieve.
   * @returns A string representation of the full user record.
   * TODO:
   *  1. Extract the user ID from arguments_["id"] — cast it to Number (e.g. Number(arguments_["id"]))
   *  2. Call this.userClient.getUser() with the numeric ID and return the result
   */
  async execute(arguments_: Record<string, any>): Promise<string> {
    // TODO
  }
}
