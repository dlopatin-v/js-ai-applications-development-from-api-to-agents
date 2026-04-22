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
    // TODO:
    // 1. Strip leading `/` from `arguments_["path"]` with `.replace(/^\/+/, "")`
    // 2. Resolve the full path by joining `this._skillsDir` with the stripped path using `path.resolve()`
    // 3. If the path does not exist (`fs.existsSync`), return an error string: `ERROR: File not found: <path>`
    // 4. If the path is not a file (`fs.statSync(...).isFile()`), return an error string: `ERROR: Not a file: <path>`
    // 5. Return the file contents via `fs.readFileSync(fullPath, "utf-8")`
    throw new Error("Not implemented");
  }
}
