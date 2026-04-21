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
    // TODO
  }

  get description(): string {
    // TODO
  }

  get parameters(): Record<string, unknown> {
    // TODO
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO
  }
}
