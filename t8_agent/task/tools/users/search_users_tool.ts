import { UserSearchRequest } from "../../../../commons/index.js";
import { BaseUserServiceTool } from "./base";

export class SearchUsersTool extends BaseUserServiceTool {
  get name() { return "search_users"; }
  get description() { return "Searches users by name, surname, email, and gender"; }
  get inputSchema() {
    return {
      type: "object",
      properties: {
        name:    { type: "string", description: "User name" },
        surname: { type: "string", description: "User surname" },
        email:   { type: "string", description: "User email" },
        gender:  { type: "string", description: "User gender", enum: ["male", "female"] },
      },
      required: [],
    };
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    try {
      return await this.userClient.searchUsers(args as unknown as UserSearchRequest);
    } catch (e: unknown) {
      return `Error while searching users: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
}
