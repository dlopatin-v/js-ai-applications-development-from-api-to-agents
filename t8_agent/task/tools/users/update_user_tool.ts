import { UserUpdate } from "../../../../commons/user_service/user_info";
import { BaseUserServiceTool } from "./base";

export class UpdateUserTool extends BaseUserServiceTool {
  get name() { return "update_user"; }
  get description() { return "Updates user info"; }
  get inputSchema() {
    return {
      type: "object",
      properties: {
        id: { type: "number", description: "User ID that should be updated" },
        new_info: {
          type: "object",
          properties: {
            name:          { type: "string" },
            surname:       { type: "string" },
            email:         { type: "string" },
            about_me:      { type: "string" },
            phone:         { type: "string" },
            date_of_birth: { type: "string" },
            gender:        { type: "string" },
            company:       { type: "string" },
            salary:        { type: "number" },
          },
        },
      },
      required: ["id"],
    };
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    try {
      const userId = String(args["id"]);
      const newInfo = args["new_info"] as unknown as UserUpdate;
      return await this.userClient.updateUser(userId, newInfo);
    } catch (e: any) {
      return `Error while updating a user: ${e.message}`;
    }
  }
}
