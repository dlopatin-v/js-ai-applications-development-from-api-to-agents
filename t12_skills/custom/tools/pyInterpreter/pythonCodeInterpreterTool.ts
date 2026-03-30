import * as path from "path";
import { BaseTool } from "../base.js";
import { T12MCPClient } from "../../mcp/mcpClient.js";
import { MCPToolModel } from "../../mcp/mcpToolModel.js";
import { ExecutionResult } from "./_response.js";
import { getFileContent } from "../../fileUtils.js";

export class PythonCodeInterpreterTool extends BaseTool {
  private constructor(
    private readonly mcpClient: T12MCPClient,
    private readonly codeExecuteTool: MCPToolModel,
    private readonly skillsDir: string,
  ) {
    super();
  }

  static async create(
    mcpUrl: string,
    toolName: string,
    skillsDir: string,
  ): Promise<PythonCodeInterpreterTool> {
    const mcpClient = await T12MCPClient.create(mcpUrl);
    const tools = await mcpClient.getTools();
    const found = tools.find((t) => t.name === toolName);
    if (!found) {
      const available = tools.map((t) => t.name).join(", ");
      throw new Error(`MCP server doesn't have \`${toolName}\` tool. Available: ${available}`);
    }
    return new PythonCodeInterpreterTool(mcpClient, found, skillsDir);
  }

  get name(): string {
    return this.codeExecuteTool.name;
  }

  get description(): string {
    return this.codeExecuteTool.description;
  }

  get parameters(): Record<string, unknown> {
    const params = { ...this.codeExecuteTool.parameters } as Record<string, unknown>;
    const properties = { ...((params["properties"] as Record<string, unknown>) ?? {}) };
    properties["script_path"] = {
      type: "string",
      description:
        "Path with a script to upload to the code interpreter. Will be combined with `code` in such way: code from file by `script_path` + \\n\\n + `code`.",
    };
    params["properties"] = properties;
    return params;
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    let callArgs: Record<string, unknown>;

    if (args["script_path"]) {
      const scriptPath = (args["script_path"] as string).replace(/^\//, "");
      const fullPath = path.resolve(this.skillsDir, scriptPath);
      const scriptContent = getFileContent(fullPath);
      callArgs = {
        code: `${scriptContent}\n\n${args["code"] ?? ""}`,
        session_id: args["session_id"] ?? "",
      };
    } else {
      callArgs = args;
    }

    const content = await this.mcpClient.callTool(this.name, callArgs);
    const result: ExecutionResult = JSON.parse(content);
    return JSON.stringify(result);
  }
}
