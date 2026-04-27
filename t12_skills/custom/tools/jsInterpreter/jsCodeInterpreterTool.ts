import * as path from "path";

import { BaseTool } from "../base";
import { ExecutionResult } from "./_response";

import { getFileContent } from "../../file_utils";
import { T12MCPClient } from "../../mcp/mcp_client";

export class JsCodeInterpreterTool extends BaseTool {
  private constructor(
    private readonly mcpClient: T12MCPClient,
    private readonly skillsDir: string,
  ) {
    super();
  }

  static async create(
    skillsDir: string,
  ): Promise<JsCodeInterpreterTool> {
    // TODO:
    // - Create a T12MCPClient using T12MCPClient.create() (no arguments — launches Docker via STDIO)
    // - Return new JsCodeInterpreterTool(mcpClient, skillsDir)
    throw new Error("Not implemented");
  }

  get name(): string {
    // TODO: Return the fixed string "execute_code"
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Return a description for the LLM explaining:
    //   - runs JS code in a persistent Node.js sandbox container
    //   - pass container_id = "" on first call; reuse the returned container_id on subsequent calls
    //   - optional script_path prepends a skill script before code
    throw new Error("Not implemented");
  }

  get parameters(): Record<string, unknown> {
    // TODO: Return a JSON Schema object with these properties:
    //   - code (string, required): JavaScript code to execute
    //   - container_id (string, default ""): empty on first call; reuse on subsequent calls
    //   - script_path (string, optional): skill script path relative to skills root, prepended to code
    throw new Error("Not implemented");
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Read container_id from args (default to "")
    // 2. Build the code string: if script_path is provided, resolve it against this.skillsDir,
    //    read the file using getFileContent, and prepend its content to code (separated by "\n\n")
    // 3. If container_id is empty, call this.mcpClient.callTool("sandbox_initialize", {})
    //    and parse the JSON result to extract the new container_id
    // 4. Call this.mcpClient.callTool("run_js", { container_id, code }) and parse the result
    //    as { stdout?: string; stderr?: string; error?: string }
    // 5. Build an ExecutionResult: success = !error, output = [stdout, stderr] (filter empty values),
    //    error = error message if present, session_info = { container_id }
    // 6. Return JSON.stringify(result)
    throw new Error("Not implemented");
  }
}
