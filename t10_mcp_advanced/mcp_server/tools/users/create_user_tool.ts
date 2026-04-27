import { UserCreate } from "../../../../commons/user_service/user_info.js";
import { BaseUserServiceTool } from "./base.js";

export class CreateUserTool extends BaseUserServiceTool {
  get name(): string {
    return "add_user";
  }

  get description(): string {
    return "Adds new user into the system";
  }

  get inputSchema(): Record<string, any> {
    return {
      type: "object",
      properties: {
        name: { type: "string", description: "User name" },
        surname: { type: "string", description: "User surname" },
        email: { type: "string", description: "User email" },
        about_me: { type: "string", description: "About the user" },
        phone: { type: "string", description: "Phone number" },
        date_of_birth: { type: "string", description: "Date of birth" },
        gender: { type: "string", description: "Gender" },
        company: { type: "string", description: "Company name" },
        salary: { type: "number", description: "Salary" },
      },
      required: ["name", "surname", "email"],
    };
  }

  async execute(arguments_: Record<string, any>): Promise<string> {
    return this.userClient.addUser(arguments_ as UserCreate);
  }
}
