import { BaseUserServiceTool } from "./base.js";

import { UserUpdate } from "../../../../commons";

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

  async execute(arguments_: Record<string, any>): Promise<string> {
    const userId = Number(arguments_["id"]);
    const newInfo = arguments_["new_info"] as UserUpdate;
    return this.userClient.updateUser(userId, newInfo);
  }
}
