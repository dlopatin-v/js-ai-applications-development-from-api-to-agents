import { UserUpdate } from "../../../../commons/user_service/user_info.js";
import { BaseUserServiceTool } from "./base.js";

export class UpdateUserTool extends BaseUserServiceTool {
  get name(): string {
    //TODO: Provide tool name as `update_user`
    throw new Error("Not implemented");
  }

  get description(): string {
    //TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, any> {
    //TODO:
    // Provide tool params Schema:
    // - id: number, required, User ID that should be updated
    // - new_info: object with UserUpdate fields (name, surname, email, about_me, phone, date_of_birth, gender, company, salary)
    throw new Error("Not implemented");
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    //TODO:
    // 1. Get `id` (number) from arguments_
    // 2. Get `new_info` from arguments_ and construct a UserUpdate object from it
    // 3. Call this.userClient.updateUser(id, newInfo) and return its result
    throw new Error("Not implemented");
  }
}
