import { BaseTool } from "../base";
import { UserServiceClient } from "../../../../commons/index.js";

/** Base class for tools that interact with the User Service.
 *  Extends BaseTool with a shared UserServiceClient instance. */
export abstract class BaseUserServiceTool extends BaseTool {
  constructor(protected userClient: UserServiceClient) {
    super();
  }
}
