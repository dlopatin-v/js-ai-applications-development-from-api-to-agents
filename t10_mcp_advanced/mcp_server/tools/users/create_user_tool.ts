import { UserCreate } from "../../../../commons/user_service/user_info.js";
import { BaseUserServiceTool } from "./base.js";

export class CreateUserTool extends BaseUserServiceTool {
  get name(): string {
    //TODO: Provide tool name as `add_user`
    throw new Error("Not implemented");
  }

  get description(): string {
    //TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, any> {
    //TODO:
    // Provide tool params Schema with the fields from UserCreate:
    // name, surname, email (required), about_me, phone, date_of_birth, gender, company, salary
    throw new Error("Not implemented");
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    //TODO:
    // 1. Construct a UserCreate object from arguments_
    // 2. Call this.userClient.addUser(user) and return its result
    throw new Error("Not implemented");
  }
}
