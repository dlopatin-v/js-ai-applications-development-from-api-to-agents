import userServiceClient from "commons/user_service/client";
import { BaseTool } from "../base.js";

export abstract class BaseUserServiceTool extends BaseTool {
  protected readonly userClient: typeof userServiceClient;

  constructor() {
    super();
    this.userClient = userServiceClient;
  }
}
