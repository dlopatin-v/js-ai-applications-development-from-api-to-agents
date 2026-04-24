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

  /**
   * Factory method: connect to the node-code-sandbox MCP server and return
   * a ready-to-use JsCodeInterpreterTool instance.
   * @param skillsDir - Path to the skills directory (for script_path resolution).
   * @returns A fully initialised JsCodeInterpreterTool.
   * Hint: use T12MCPClient.create() (no arguments — it launches the Docker container
   * automatically via STDIO).
   */
  static async create(
    skillsDir: string,
  ): Promise<JsCodeInterpreterTool> {
    // TODO
  }

  /**
   * The tool name exposed to the LLM.
   * @returns `"execute_code"` (fixed — wraps the underlying `run_js` tool)
   */
  get name(): string {
    // TODO
  }

  /**
   * A description of what this tool does, for the LLM.
   * Describe: persistent Node.js sandbox, container_id lifecycle, script_path support.
   */
  get description(): string {
    // TODO
  }

  /**
   * JSON Schema for the tool's inputs.
   * Properties:
   *   - `code` (string, required): JavaScript code to execute.
   *   - `container_id` (string, default ""): empty on first call; reuse on subsequent calls.
   *   - `script_path` (string, optional): skill script path prepended to `code`.
   */
  get parameters(): Record<string, unknown> {
    // TODO
  }

  /**
   * Execute JavaScript code in the Node.js sandbox.
   * @param args - May include `script_path`, `code`, and `container_id`.
   *
   * Steps:
   * 1. Read `container_id` from args (default "").
   * 2. Build the code string: if `script_path` is provided, resolve it against
   *    `this.skillsDir`, read the file, and prepend its content to `code`
   *    (separated by "\n\n").
   * 3. If `container_id` is empty, call `this.mcpClient.callTool("sandbox_initialize", {})`
   *    and parse the result to get the new `container_id`.
   * 4. Call `this.mcpClient.callTool("run_js", { container_id, code })` and parse
   *    the result as `{ stdout?: string; stderr?: string; error?: string }`.
   * 5. Build an ExecutionResult: success = !error, output = [stdout, stderr] filtered,
   *    error = error message, session_info = { container_id }.
   * 6. Return JSON.stringify(result).
   */
  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO
  }
}
