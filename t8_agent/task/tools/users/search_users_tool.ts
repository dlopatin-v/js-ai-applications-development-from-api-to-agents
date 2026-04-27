import { BaseUserServiceTool } from "./base";

import { UserSearchRequest } from "../../../../commons";

export class SearchUsersTool extends BaseUserServiceTool {
  // TODO: Provide tool name as `search_users`
  get name(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide description of this tool
  get description(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide tool params Schema.
  //   Properties: name (str), surname (str), email (str), gender (str)
  //   None of them are required
  get inputSchema(): Record<string, unknown> {
    throw new Error("Not implemented");
  }

  // TODO:
  // 1. Call this.userClient.searchUsers with args and return its result
  // 2. Optional: wrap with try/catch and return error as string `Error while searching users: ${e.message}`
  async execute(args: Record<string, unknown>): Promise<string> {
    throw new Error("Not implemented");
  }
}
