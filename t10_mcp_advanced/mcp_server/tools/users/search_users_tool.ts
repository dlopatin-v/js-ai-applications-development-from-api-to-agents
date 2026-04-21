import { BaseUserServiceTool } from "./base.js";

export class SearchUsersTool extends BaseUserServiceTool {
  get name(): string {
    return "search_users";
  }

  get description(): string {
    return "Searches users by name, surname, email, and gender";
  }

  get inputSchema(): Record<string, any> {
    return {
      type: "object",
      properties: {
        name: { type: "string", description: "User name" },
        surname: { type: "string", description: "User surname" },
        email: { type: "string", description: "User email" },
        gender: {
          type: "string",
          description: "User gender",
          enum: ["male", "female"],
        },
      },
      required: [],
    };
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    // TODO
  }
}
