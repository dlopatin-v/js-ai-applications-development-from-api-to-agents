import { BaseTool } from "../base";

import userServiceClient from "../../../../commons/user_service/client.js";

export abstract class BaseUserServiceTool extends BaseTool {
  protected readonly userClient: typeof userServiceClient;

  constructor() {
    super();
    this.userClient = userServiceClient;
  }
}
