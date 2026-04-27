import { BaseUserServiceTool } from "./base";

import { UserSearchRequest } from "../../../../commons";

export class SearchUsersTool extends BaseUserServiceTool {
  get name(): string {
    //TODO: Provide tool name as `search_users`
    throw new Error("Not implemented");
  }

  get description(): string {
    //TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, any> {
    //TODO:
    // Provide tool params Schema:
    // - name: string
    // - surname: string
    // - email: string
    // - gender: string (enum: "male" | "female")
    // None of them are required (see UserClient.searchUsers method)
    throw new Error("Not implemented");
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    //TODO:
    // Call this.userClient.searchUsers({ ...arguments_ }) and return its result
    throw new Error("Not implemented");
  }
}
