import { BaseUserServiceTool } from "./base";

export class SearchUsersTool extends BaseUserServiceTool {
  get name(): string {
    // TODO: Provide tool name as `search_users`
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, unknown> {
    // TODO: Provide tool params Schema:
    // - name: string
    // - surname: string
    // - email: string
    // - gender: string (enum: ["male", "female"])
    // None of them are required (all optional)
    throw new Error("Not implemented");
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Call this.userClient.searchUsers(args) and return the result
    // 2. Optional: wrap with try/catch and return `Error while searching users: ${e.message}`
    throw new Error("Not implemented");
  }
}
