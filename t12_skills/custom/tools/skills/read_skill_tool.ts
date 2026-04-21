import * as path from "path";
import { BaseTool } from "../base.js";
import { getFileContent } from "../../file_utils.js";

export class ReadSkillTool extends BaseTool {
  private readonly resolvedSkillsDir: string;

  constructor(skillsDir: string) {
    super();
    this.resolvedSkillsDir = path.resolve(skillsDir);
  }

  /**
   * The tool name exposed to the LLM.
   * @returns "read_skill"
   */
  get name(): string {
    // TODO
  }

  /**
   * Human-readable description of what this tool does.
   * @returns A string explaining that this tool reads a skill file by path,
   * with examples like /calculator/SKILL.md or /calculator/scripts/calculate.ts.
   */
  get description(): string {
    // TODO
  }

  /**
   * JSON Schema for the tool's input arguments.
   * @returns An object schema with a single required `path` string property
   * describing that it is relative to the skills root.
   */
  get parameters(): Record<string, unknown> {
    // TODO
  }

  /**
   * Read and return the contents of the requested skill file.
   * @param args - Must contain `path` (string): path relative to skills root.
   * @returns The file content as a string.
   * Hint: strip a leading "/" from args["path"], then resolve against
   * `this.resolvedSkillsDir` and call `getFileContent(fullPath)`.
   */
  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO
  }
}
