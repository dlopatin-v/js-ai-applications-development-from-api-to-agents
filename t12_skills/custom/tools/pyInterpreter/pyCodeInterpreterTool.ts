import * as path from "path";

import { BaseTool } from "../base";
import { ExecutionResult, normalizeExecutionResult } from "./_response";

import { getFileContent } from "../../file_utils";
import { T12MCPClient } from "../../mcp/mcp_client";
import { MCPToolModel } from "../../mcp/mcp_tool_model";

export class PyCodeInterpreterTool extends BaseTool {
  private readonly codeExecuteTool: MCPToolModel;

  private constructor(
    private readonly mcpClient: T12MCPClient,
    mcpToolModels: MCPToolModel[],
    toolName: string,
    private readonly skillsDir: string,
  ) {
    super();

    const found = mcpToolModels.find((m) => m.name === toolName);
    if (!found) {
      const available = mcpToolModels.map((m) => m.name);
      throw new Error(
        `MCP server doesn't have \`${toolName}\` tool. Available: ${JSON.stringify(available)}`,
      );
    }
    this.codeExecuteTool = found;
  }

  static async create(
    mcpUrl: string,
    toolName: string,
    skillsDir: string,
  ): Promise<PyCodeInterpreterTool> {
    const mcpClient = await T12MCPClient.create(mcpUrl);
    const tools = await mcpClient.getTools();
    return new PyCodeInterpreterTool(mcpClient, tools, toolName, skillsDir);
  }

  get name(): string {
    return this.codeExecuteTool.name;
  }

  get description(): string {
    return this.codeExecuteTool.description;
  }

  get parameters(): Record<string, unknown> {
    // Shallow clone the discovered schema and inject script_path.
    const base = this.codeExecuteTool.parameters as {
      properties?: Record<string, unknown>;
      [key: string]: unknown;
    };
    const properties = { ...(base.properties ?? {}) };
    properties["script_path"] = {
      type: "string",
      description:
        "Path with python script to upload to code interpreter. Will be combined with `code` in such way: code from file by `script_path` + \\n\\n + `code`.",
    };
    return {
      ...base,
      properties,
    };
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    let toolArgs: Record<string, unknown>;

    const scriptPath = args["script_path"] as string | undefined;
    if (scriptPath) {
      const fullPath = path.resolve(this.skillsDir, scriptPath.replace(/^\//, ""));
      const scriptContent = getFileContent(fullPath);
      toolArgs = {
        code: `${scriptContent}\n\n${(args["code"] as string | undefined) ?? ""}`,
        session_id: (args["session_id"] as string | undefined) ?? "",
      };
    } else {
      toolArgs = args;
    }

    const content = await this.mcpClient.callTool(this.name, toolArgs);
    const parsed: ExecutionResult = normalizeExecutionResult(JSON.parse(content));
    return JSON.stringify(parsed);
  }
}
