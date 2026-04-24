import * as path from "path";
import { BaseTool } from "../base.js";
import { T12MCPClient } from "../../mcp/mcp_client.js";
import { MCPToolModel } from "../../mcp/mcp_tool_model.js";
import { ExecutionResult } from "./_response.js";
import { getFileContent } from "../../file_utils.js";

/**
 * Wraps the node-code-sandbox MCP server's sandbox lifecycle tools and exposes
 * them to the agent as a single `execute_code` tool.
 *
 * Lifecycle per conversation:
 *   1. First call (container_id = ""): calls `sandbox_initialize` to start a
 *      container, then calls `run_js` with the script content prepended to the
 *      user code.  Returns the container_id in session_info so the agent can
 *      reuse it.
 *   2. Subsequent calls: calls `run_js` directly with the saved container_id.
 *
 * The external tool name exposed to the LLM is `execute_code` (not `run_js`)
 * so the SKILL.md workflow stays consistent regardless of the underlying server.
 */
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
    const mcpClient = await T12MCPClient.create();
    return new JsCodeInterpreterTool(mcpClient, skillsDir);
  }

  get name(): string {
    return "execute_code";
  }

  get description(): string {
    return (
      "Execute JavaScript code in a persistent Node.js sandbox. " +
      "On the first call pass an empty string as container_id — a new sandbox container " +
      "will be started and its ID returned in session_info.container_id. " +
      "Pass that ID in all subsequent calls to reuse the same container. " +
      "Optionally provide script_path to prepend a skill script before your code."
    );
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "JavaScript code to execute (ESModules syntax).",
        },
        container_id: {
          type: "string",
          description:
            "Sandbox container identifier. Pass an empty string on the first call " +
            "to create a new sandbox; reuse the returned container_id for follow-up calls.",
          default: "",
        },
        script_path: {
          type: "string",
          description:
            "Path to a skill script file relative to the skills root " +
            "(e.g. unit-converter/scripts/convert.ts). " +
            "Its content will be prepended before `code`, combined as " +
            "<script content>\\n\\n<code>.",
        },
      },
      required: ["code"],
    };
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    let containerId = (args["container_id"] as string | undefined) ?? "";

    // Build the code to run: prepend script file if requested
    let code = (args["code"] as string) ?? "";
    if (args["script_path"]) {
      const scriptPath = (args["script_path"] as string).replace(/^\//, "");
      const fullPath = path.resolve(this.skillsDir, scriptPath);
      const scriptContent = getFileContent(fullPath);
      code = `${scriptContent}\n\n${code}`;
    }

    // Initialize a new sandbox container on first call
    if (!containerId) {
      const initResult = await this.mcpClient.callTool("sandbox_initialize", {});
      const initJson = JSON.parse(initResult) as { container_id: string };
      containerId = initJson.container_id;
    }

    // Execute the code in the sandbox
    const rawResult = await this.mcpClient.callTool("run_js", {
      container_id: containerId,
      code,
    });

    const runResult = JSON.parse(rawResult) as { stdout?: string; stderr?: string; error?: string };

    const result: ExecutionResult = {
      success: !runResult.error,
      output: [
        ...(runResult.stdout ? [runResult.stdout] : []),
        ...(runResult.stderr ? [runResult.stderr] : []),
      ],
      error: runResult.error,
      session_info: { container_id: containerId },
    };

    return JSON.stringify(result);
  }
}
