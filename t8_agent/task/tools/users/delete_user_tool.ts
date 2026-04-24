import { BaseUserServiceTool } from "./base";

export class DeleteUserTool extends BaseUserServiceTool {
  get name(): string {
    // TODO: Provide tool name as `delete_users`
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, unknown> {
    // TODO: Provide tool params Schema.
    // This tool takes user `id` (number) as a required parameter.
    throw new Error("Not implemented");
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Extract id from args
    // 2. Call this.userClient.deleteUser(String(id)) and return the result
    // 3. Optional: wrap with try/catch and return `Error while deleting user by id: ${e.message}`
    throw new Error("Not implemented");
  }
}
