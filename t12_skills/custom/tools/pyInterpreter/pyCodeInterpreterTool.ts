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
    // - Find the MCP tool whose name matches `toolName` in mcpToolModels
    // - If not found, throw an error listing the available tool names
    // - Assign the matched tool to this.codeExecuteTool
    throw new Error("Not implemented");
  }

  static async create(
    mcpUrl: string,
    toolName: string,
    skillsDir: string,
  ): Promise<PyCodeInterpreterTool> {
    // TODO:
    // - Create a T12MCPClient via T12MCPClient.create(mcpUrl)
    // - Fetch the available MCP tools via mcpClient.getTools()
    // - Return a new PyCodeInterpreterTool instance with the discovered tools
    throw new Error("Not implemented");
  }

  get name(): string {
    // TODO: Return the discovered MCP tool's name (e.g. "execute_code")
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Return the discovered MCP tool's own description
    throw new Error("Not implemented");
  }

  get parameters(): Record<string, unknown> {
    // TODO:
    // Build the tool schema by cloning the discovered MCP schema and INJECTING a `script_path` property:
    // - Treat the existing parameters as { properties?, ...rest }
    // - Shallow-clone the properties (defaulting to {})
    // - Add a `script_path` string property with a description explaining that the tool will
    //   prepend the file content (loaded from disk) before the `code` argument, so the agent
    //   doesn't have to copy the script body into the request
    // - Return the merged schema
    throw new Error("Not implemented");
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // - Read script_path from args (optional)
    // - If set:
    //   - Resolve the full path against this.skillsDir (strip a leading "/")
    //   - Read the script content with getFileContent()
    //   - Build toolArgs = { code: <scriptContent>\n\n<args.code ?? "">, session_id: args.session_id ?? "" }
    // - Otherwise pass args through unchanged
    // - Call mcpClient.callTool(this.name, toolArgs)
    // - Parse the response with normalizeExecutionResult(JSON.parse(content)) and return JSON.stringify(parsed)
    throw new Error("Not implemented");
  }
}
