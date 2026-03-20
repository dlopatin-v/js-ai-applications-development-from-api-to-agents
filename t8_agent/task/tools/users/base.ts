import userServiceClient from "../../../../commons/user_service/client";
import { BaseTool } from "../base";

/** Base class for tools that interact with the User Service.
 *  Extends BaseTool with a shared UserServiceClient instance. */
export abstract class BaseUserServiceTool extends BaseTool {
  protected readonly userClient = userServiceClient;
}
