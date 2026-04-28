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

    // TODO:
    // 1. Find the MCP tool whose `name` equals `toolName` in `mcpToolModels`
    // 2. If not found, throw new Error(`MCP server doesn't have \`${toolName}\` tool. Available: ${JSON.stringify(<tool names>)}`)
    // 3. Assign the matched tool to `this.codeExecuteTool`
    throw new Error("Not implemented");
  }

  static async create(
    mcpUrl: string,
    toolName: string,
    skillsDir: string,
  ): Promise<PyCodeInterpreterTool> {
    // TODO:
    // 1. Call `await T12MCPClient.create(mcpUrl)`, assign to `mcpClient`
    // 2. Call `await mcpClient.getTools()`, assign to `tools`
    // 3. Return `new PyCodeInterpreterTool(mcpClient, tools, toolName, skillsDir)`
    throw new Error("Not implemented");
  }

  get name(): string {
    // TODO: Return `this.codeExecuteTool.name` (the discovered MCP tool's name, e.g. "execute_code")
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Return `this.codeExecuteTool.description` (forward the MCP tool's own description)
    throw new Error("Not implemented");
  }

  get parameters(): Record<string, unknown> {
    // TODO: Build the tool schema by cloning the discovered MCP schema and INJECTING a `script_path` property
    // 1. Treat `this.codeExecuteTool.parameters` as `{ properties?: Record<string, unknown>, ...rest }`,
    //    assign to `base`
    // 2. Shallow-clone `base.properties` (default to `{}` if undefined), assign to `properties`
    // 3. Add `properties["script_path"] = {
    //      type: "string",
    //      description: "Path with python script to upload to code interpreter. Will be combined with `code` in such way: code from file by `script_path` + \\n\\n + `code`.",
    //    }`
    // 4. Return `{ ...base, properties }`
    throw new Error("Not implemented");
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Declare `let toolArgs: Record<string, unknown>`
    // 2. Read `scriptPath = args["script_path"] as string | undefined`
    // 3. If `scriptPath` is set:
    //       a. Resolve `fullPath = path.resolve(this.skillsDir, scriptPath.replace(/^\//, ""))`
    //       b. Read script content with `getFileContent(fullPath)`, assign to `scriptContent`
    //       c. Build toolArgs:
    //          {
    //            code: `${scriptContent}\n\n${(args["code"] as string | undefined) ?? ""}`,
    //            session_id: (args["session_id"] as string | undefined) ?? "",
    //          }
    //    Else:
    //       a. Pass args through: `toolArgs = args`
    // 4. Call `await this.mcpClient.callTool(this.name, toolArgs)`, assign to `content`
    // 5. Parse with `normalizeExecutionResult(JSON.parse(content))`, assign to `parsed`
    // 6. Return `JSON.stringify(parsed)`
    throw new Error("Not implemented");
  }
}
