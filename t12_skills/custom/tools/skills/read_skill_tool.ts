import * as path from "path";

import { BaseTool } from "../base";

import { getFileContent } from "../../file_utils";

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
      "Reads a skill file by path from the local skills directory. " +
      "Use this to access skill instructions, scripts, references, or any other skill resource. " +
      "Paths are relative to the skills root, e.g. /unit-converter/SKILL.md or /unit-converter/scripts/convert.ts"
    );
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Path to the skill file relative to the skills root. E.g. /unit-converter/SKILL.md or /unit-converter/scripts/convert.ts",
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
