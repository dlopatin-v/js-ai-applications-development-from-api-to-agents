import * as fs from "fs";
import * as path from "path";
import { BaseTool } from "./base.js";

export class ReadSkillTool extends BaseTool {
  private readonly _skillsDir: string;

  constructor(skillsDir: string) {
    super();
    this._skillsDir = path.resolve(skillsDir);
  }

  get name(): string {
    return "read_skill";
  }

  get description(): string {
    return (
      "Read a skill file by its path. Use this to access skill instructions, " +
      "scripts, references, or any other skill resource. " +
      "Paths are relative to the skills root, e.g. /sample/SKILL.md"
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
            "E.g. /sample/SKILL.md",
        },
      },
      required: ["path"],
    };
  }

  protected async _execute(arguments_: Record<string, unknown>): Promise<string> {
    const rawPath = (arguments_["path"] as string).replace(/^\/+/, "");
    const fullPath = path.resolve(this._skillsDir, rawPath);

    if (!fs.existsSync(fullPath)) {
      return `ERROR: File not found: ${fullPath}`;
    }

    if (!fs.statSync(fullPath).isFile()) {
      return `ERROR: Not a file: ${fullPath}`;
    }

    return fs.readFileSync(fullPath, "utf-8");
  }
}
