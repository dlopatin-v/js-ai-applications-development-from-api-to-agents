import { BaseMcpClient } from "../clients/base_mcp_client";
import { McpToolModel } from "../models";
import { BaseTool } from "./base";

export class McpTool extends BaseTool {
  private readonly _client: BaseMcpClient;
  private readonly _mcpToolModel: McpToolModel;

  constructor(client: BaseMcpClient, mcpToolModel: McpToolModel) {
    super();
    this._client = client;
    this._mcpToolModel = mcpToolModel;
  }

  get name(): string {
    return this._mcpToolModel.name;
  }

  get description(): string {
    return this._mcpToolModel.description;
  }

  get parameters(): Record<string, unknown> {
    return this._mcpToolModel.parameters;
  }

  protected async _execute(arguments_: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Delegate to `this._client.callTool(this.name, arguments_)` (async) and return the result
    throw new Error("Not implemented");
  }
}
