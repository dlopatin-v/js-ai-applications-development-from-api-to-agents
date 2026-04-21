import * as path from "path";
import { BaseTool } from "../base.js";
import { getFileContent } from "../../file_utils.js";

export class ReadSkillTool extends BaseTool {
  private readonly resolvedSkillsDir: string;

  constructor(skillsDir: string) {
    super();
    this.resolvedSkillsDir = path.resolve(skillsDir);
  }

  get name(): string {
    return "read_skill";
  }

  get description(): string {
    return (
      "Read a skill file by its path. Use this to access skill instructions, " +
      "scripts, references, or any other skill resource. " +
      "Paths are relative to the skills root, e.g. /calculator/SKILL.md " +
      "or /calculator/scripts/calculate.ts"
    );
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Path to the skill file relative to the skills root. " +
            "E.g. /calculator/SKILL.md or /calculator/scripts/calculate.ts",
        },
      },
      required: ["path"],
    };
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    const rawPath = (args["path"] as string).replace(/^\//, "");
    const fullPath = path.resolve(this.resolvedSkillsDir, rawPath);
    return getFileContent(fullPath);
  }
}
