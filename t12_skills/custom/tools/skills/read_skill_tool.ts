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
    // TODO: Return the tool name
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Return a description telling the agent when and how to use this tool
    //       (what it reads, what path format to use)
    throw new Error("Not implemented");
  }

  get parameters(): Record<string, unknown> {
    // TODO: Return the JSON schema for the tool parameters
    //       Single required string parameter "path" with a description of the expected format
    throw new Error("Not implemented");
  }

  protected async _execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // - Get the path from args and strip the leading "/"
    // - Resolve the full filesystem path by joining this.resolvedSkillsDir with the relative path
    // - Return the file content using the `getFileContent` function
    throw new Error("Not implemented");
  }
}
