import { BaseUserServiceTool } from "./base";

export class GetUserByIdTool extends BaseUserServiceTool {
  // TODO: Provide tool name as `get_user_by_id`
  get name(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide description of this tool
  get description(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide tool params Schema.
  //   This tool takes user `id` (number) as a required parameter
  get inputSchema(): Record<string, unknown> {
    throw new Error("Not implemented");
  }

  // TODO:
  // 1. Get `id` from args
  // 2. Call this.userClient.getUser and return its result
  // 3. Optional: wrap with try/catch and return error as string `Error while retrieving user by id: ${e.message}`
  async execute(args: Record<string, unknown>): Promise<string> {
    throw new Error("Not implemented");
  }
}
