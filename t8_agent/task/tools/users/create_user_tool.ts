import { BaseUserServiceTool } from "./base";

export class CreateUserTool extends BaseUserServiceTool {
  get name(): string {
    // TODO: Provide tool name as `add_user`
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, unknown> {
    // TODO: Provide tool params Schema for creating a user.
    // Required fields: name, surname, email
    // Optional fields: about_me, phone, date_of_birth, gender, company, salary,
    //   address (object: country, city, street, flat_house),
    //   credit_card (object: num, cvv, exp_date)
    throw new Error("Not implemented");
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Call this.userClient.addUser(args) and return the result
    // 2. Optional: wrap with try/catch and return `Error while creating a new user: ${e.message}`
    throw new Error("Not implemented");
  }
}
