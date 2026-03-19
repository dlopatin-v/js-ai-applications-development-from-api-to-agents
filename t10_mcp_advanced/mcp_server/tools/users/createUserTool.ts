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

  /**
   * Creates a new user in the User Service.
   * @param arguments_ - Object containing the fields defined in inputSchema (name, surname, email required).
   * @returns A string with the API response confirming the created user.
   * Hint: cast arguments_ to UserCreate and call this.userClient.addUser().
   */
  async execute(arguments_: Record<string, any>): Promise<string> {
    // TODO
  }
}
