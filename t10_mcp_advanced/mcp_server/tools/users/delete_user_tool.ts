import { BaseUserServiceTool } from "./base";

export class DeleteUserTool extends BaseUserServiceTool {
  get name(): string {
    //TODO: Provide tool name as `delete_user`
    throw new Error("Not implemented");
  }

  get description(): string {
    //TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, any> {
    //TODO: Provide tool params Schema. This tool applies user `id` (number) as a parameter and it is required
    throw new Error("Not implemented");
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    //TODO:
    // 1. Get `id` (number) from arguments_
    // 2. Call this.userClient.deleteUser(id) and return its result
    throw new Error("Not implemented");
  }
}
