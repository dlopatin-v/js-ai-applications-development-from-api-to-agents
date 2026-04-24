import { BaseUserServiceTool } from "./base";

export class CreateUserTool extends BaseUserServiceTool {
  // TODO: Provide tool name as `add_user`
  get name(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide description of this tool
  get description(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide tool params Schema.
  //   Properties: name, surname, email (required); about_me, phone, date_of_birth, gender, company, salary (optional);
  //   address object (country, city, street, flat_house); credit_card object (num, cvv, exp_date)
  get inputSchema(): Record<string, unknown> {
    throw new Error("Not implemented");
  }

  // TODO:
  // 1. Call this.userClient.addUser with args and return its result
  // 2. Optional: wrap with try/catch and return error as string `Error while creating a new user: ${e.message}`
  async execute(args: Record<string, unknown>): Promise<string> {
    throw new Error("Not implemented");
  }
}
