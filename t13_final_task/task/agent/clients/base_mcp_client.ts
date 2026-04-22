import { McpToolModel } from "../models.js";

export abstract class BaseMcpClient {
  abstract getTools(): Promise<McpToolModel[]>;
  abstract callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<string>;
}
