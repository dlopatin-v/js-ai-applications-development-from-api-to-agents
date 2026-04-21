import { UserUpdate } from "../../../../commons/user_service/user_info.js";
import { BaseUserServiceTool } from "./base.js";

export class UpdateUserTool extends BaseUserServiceTool {
  get name(): string {
    return "update_user";
  }

  get description(): string {
    return "Updates user info";
  }

  get inputSchema(): Record<string, any> {
    return {
      type: "object",
      properties: {
        id: { type: "number", description: "User ID that should be updated." },
        new_info: {
          type: "object",
          description: "Fields to update",
          properties: {
            name: { type: "string" },
            surname: { type: "string" },
            email: { type: "string" },
            about_me: { type: "string" },
            phone: { type: "string" },
            date_of_birth: { type: "string" },
            gender: { type: "string" },
            company: { type: "string" },
            salary: { type: "number" },
          },
        },
      },
      required: ["id"],
    };
  }

  /**
   * Updates an existing user's fields in the User Service.
   * @param arguments_ - Object with `id` (required) and `new_info` (object with fields to update).
   * @returns A string with the API response containing the updated user record.
   * TODO:
   *  1. Extract the user ID from arguments_["id"] — cast it to Number (e.g. Number(arguments_["id"]))
   *  2. Extract the update payload from arguments_["new_info"] and cast it as UserUpdate
   *  3. Call this.userClient.updateUser() with the numeric ID and the update payload, and return the result
   */
  async execute(arguments_: Record<string, any>): Promise<string> {
    // TODO
  }
}
