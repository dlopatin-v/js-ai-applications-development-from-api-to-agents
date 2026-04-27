import { BaseUserServiceTool } from "./base";

import { UserUpdate } from "../../../../commons";

export class UpdateUserTool extends BaseUserServiceTool {
  get name(): string {
    // TODO: Provide tool name as `update_user`
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, unknown> {
    // TODO: Provide tool params Schema for updating a user.
    // Required fields: id (number — the user to update)
    // Optional nested object `new_info` with updatable fields:
    //   name, surname, email, about_me, phone, date_of_birth, gender, company, salary
    throw new Error("Not implemented");
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Extract id (number) and new_info (object) from args
    // 2. Call this.userClient.updateUser(id, new_info) and return the result
    // 3. Optional: wrap with try/catch and return `Error while updating a user: ${e.message}`
    throw new Error("Not implemented");
  }
}
