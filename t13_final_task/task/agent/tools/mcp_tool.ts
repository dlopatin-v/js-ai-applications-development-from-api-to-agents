import { BaseMcpClient } from "../clients/base_mcp_client.js";
import { McpToolModel } from "../models.js";
import { BaseTool } from "./base.js";

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
    return this._client.callTool(this.name, arguments_);
  }
}
