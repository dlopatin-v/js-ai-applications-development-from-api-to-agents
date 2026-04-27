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

  static async create(skillsDir: string): Promise<JsCodeInterpreterTool> {
    const mcpClient = await T12MCPClient.create();
    return new JsCodeInterpreterTool(mcpClient, skillsDir);
  }

  get name(): string {
    return "execute_code";
  }

  get description(): string {
    return (
      "Execute JavaScript code in a persistent Node.js sandbox container (via mcp/node-code-sandbox). " +
      "Pass container_id = \"\" on the first call; the returned session_info.container_id must be reused on all subsequent calls. " +
      "Optional script_path prepends a skill script (relative to the skills root) to the code before execution."
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
          description: "Sandbox container ID. Empty string on first call; reuse on subsequent calls.",
          default: "",
        },
        script_path: {
          type: "string",
          description:
            "Path to a skill script relative to the skills root — its content is prepended to code.",
        },
      },
      required: ["code"],
    };
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    let containerId = (args["container_id"] as string | undefined) ?? "";
    let code = args["code"] as string;

    const scriptPath = args["script_path"] as string | undefined;
    if (scriptPath) {
      const fullPath = path.resolve(this.skillsDir, scriptPath.replace(/^\//, ""));
      const scriptContent = getFileContent(fullPath);
      code = `${scriptContent}\n\n${code}`;
    }

    if (!containerId) {
      const initResult = await this.mcpClient.callTool("sandbox_initialize", {});
      containerId = JSON.parse(initResult).container_id as string;
    }

    const runResult = await this.mcpClient.callTool("run_js", { container_id: containerId, code });
    const parsed = JSON.parse(runResult) as { stdout?: string; stderr?: string; error?: string };

    const result: ExecutionResult = {
      success: !parsed.error,
      output: [parsed.stdout, parsed.stderr].filter(Boolean) as string[],
      ...(parsed.error ? { error: parsed.error } : {}),
      session_info: { container_id: containerId },
    };

    return JSON.stringify(result);
  }
}
