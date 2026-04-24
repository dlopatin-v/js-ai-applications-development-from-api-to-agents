import * as path from "path";
import { BaseTool } from "../base.js";
import { getFileContent } from "../../file_utils.js";

export class ReadSkillTool extends BaseTool {
  private readonly resolvedSkillsDir: string;

  constructor(skillsDir: string) {
    super();
    // TODO: Resolve skillsDir with path.resolve() and assign to this.resolvedSkillsDir
    throw new Error("Not implemented");
  }

  get name(): string {
    // TODO: Return the fixed string "read_skill"
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Return a description telling the agent:
    //   - what the tool does (reads a skill file by path from the local skills directory)
    //   - when to use it (accessing skill instructions, scripts, references, or any other skill resource)
    //   - what path format to use (relative to the skills root, e.g. /calculator/SKILL.md
    //     or /calculator/scripts/calculate.ts)
    throw new Error("Not implemented");
  }

  get parameters(): Record<string, unknown> {
    // TODO: Return a JSON Schema object:
    //   - type: "object"
    //   - properties: { path: { type: "string", description: "Path to the skill file relative to the skills root. E.g. /unit-converter/SKILL.md or /unit-converter/scripts/convert.ts" } }
    //   - required: ["path"]
    throw new Error("Not implemented");
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // 1. Get `rawPath` from args["path"] as a string and strip the leading "/" (use lstrip equivalent: replace(/^\//, ""))
    // 2. Resolve the full filesystem path: path.resolve(this.resolvedSkillsDir, rawPath)
    // 3. Return getFileContent(fullPath)
    throw new Error("Not implemented");
  }
}
