import * as path from "path";
import { BaseTool } from "../base.js";
import { T12MCPClient } from "../../mcp/mcp_client.js";
import { ExecutionResult } from "./_response.js";
import { getFileContent } from "../../file_utils.js";

export class JsCodeInterpreterTool extends BaseTool {
  private constructor(
    private readonly mcpClient: T12MCPClient,
    private readonly skillsDir: string,
  ) {
    super();
  }

  static async create(skillsDir: string): Promise<JsCodeInterpreterTool> {
    // TODO:
    // 1. Call `await T12MCPClient.create()` (no arguments — launches Docker via STDIO), assign to `mcpClient`
    // 2. Return `new JsCodeInterpreterTool(mcpClient, skillsDir)`
    throw new Error("Not implemented");
  }

  get name(): string {
    // TODO: Return the fixed string "execute_code"
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Return a description for the LLM explaining:
    //   - runs JavaScript code in a persistent Node.js sandbox container (via mcp/node-code-sandbox)
    //   - pass container_id = "" on the first call; reuse the returned container_id on subsequent calls
    //   - optional script_path prepends a skill script (relative to skills root) before the code
    throw new Error("Not implemented");
  }

  get parameters(): Record<string, unknown> {
    // TODO: Return a JSON Schema object with these properties:
    //   - code (string, required): "JavaScript code to execute (ESModules syntax)"
    //   - container_id (string, default ""): "Sandbox container ID. Empty string on first call; reuse on subsequent calls"
    //   - script_path (string, optional): "Path to a skill script relative to the skills root, prepended to code"
    // required: ["code"]
    throw new Error("Not implemented");
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Read `containerId` from args["container_id"] as string (default to "")
    // 2. Read `code` from args["code"] as string
    // 3. If args["script_path"] is a non-empty string:
    //       a. Resolve the full path: path.resolve(this.skillsDir, (args["script_path"] as string).replace(/^\//, ""))
    //       b. Read the script content using getFileContent(fullPath)
    //       c. Set code = `${scriptContent}\n\n${code}`
    // 4. If containerId is empty:
    //       a. Call `await this.mcpClient.callTool("sandbox_initialize", {})`, assign to `initResult`
    //       b. Parse initResult as JSON and extract container_id: `containerId = JSON.parse(initResult).container_id`
    // 5. Call `await this.mcpClient.callTool("run_js", { container_id: containerId, code })`, assign to `runResult`
    // 6. Parse runResult as `{ stdout?: string; stderr?: string; error?: string }`
    // 7. Build an ExecutionResult:
    //       - success: !parsed.error
    //       - output: [parsed.stdout, parsed.stderr].filter(Boolean) as string[]
    //       - error: parsed.error (if present)
    //       - session_info: { container_id: containerId }
    // 8. Return JSON.stringify(result)
    throw new Error("Not implemented");
  }
}
