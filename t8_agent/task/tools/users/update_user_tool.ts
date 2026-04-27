import { BaseUserServiceTool } from "./base";

import { UserUpdate } from "../../../../commons";

export class UpdateUserTool extends BaseUserServiceTool {
  // TODO: Provide tool name as `update_user`
  get name(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide description of this tool
  get description(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide tool params Schema.
  //   Properties: id (number, required, User ID that should be updated),
  //   new_info (object with optional fields: name, surname, email, about_me, phone,
  //   date_of_birth, gender, company, salary)
  get inputSchema(): Record<string, unknown> {
    throw new Error("Not implemented");
  }

  // TODO:
  // 1. Get `id` from args
  // 2. Get `new_info` from args
  // 3. Call this.userClient.updateUser and return its result
  // 4. Optional: wrap with try/catch and return error as string `Error while updating a user: ${e.message}`
  async execute(args: Record<string, unknown>): Promise<string> {
    throw new Error("Not implemented");
  }
}
