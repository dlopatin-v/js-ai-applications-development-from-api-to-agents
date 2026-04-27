import { BaseUserServiceTool } from "./base";

import { UserCreate } from "../../../../commons";

export class CreateUserTool extends BaseUserServiceTool {
  get name() { return "add_user"; }
  get description() { return "Adds new user"; }
  get inputSchema() {
    return {
      type: "object",
      properties: {
        name:          { type: "string", description: "First name" },
        surname:       { type: "string", description: "Last name" },
        email:         { type: "string", description: "Email address" },
        about_me:      { type: "string", description: "Short bio" },
        phone:         { type: "string", description: "Phone number" },
        date_of_birth: { type: "string", description: "Date of birth" },
        gender:        { type: "string", description: "Gender" },
        company:       { type: "string", description: "Company name" },
        salary:        { type: "number", description: "Salary" },
        address: {
          type: "object",
          properties: {
            country:    { type: "string" },
            city:       { type: "string" },
            street:     { type: "string" },
            flat_house: { type: "string" },
          },
        },
        credit_card: {
          type: "object",
          properties: {
            num:      { type: "string" },
            cvv:      { type: "string" },
            exp_date: { type: "string" },
          },
        },
      },
      required: ["name", "surname", "email"],
    };
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    try {
      return await this.userClient.addUser(args as unknown as UserCreate);
    } catch (e: unknown) {
      return `Error while creating a new user: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
}
