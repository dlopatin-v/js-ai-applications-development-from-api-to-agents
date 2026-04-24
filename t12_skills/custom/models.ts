import * as fs from "fs";
import * as path from "path";

export interface SkillMetadata {
  name: string;
  description: string;
  skillDir: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowedTools?: string[];
}

const NAME_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function validate(
  name: string,
  description: string,
  compatibility: string | undefined,
  dirName: string,
): string[] {
  // TODO:
  // 1. Initialize `errors: string[] = []`
  // 2. If name is empty, push "name is empty"
  //    Else if name length > 64, push "name exceeds 64 chars (N)"
  //    Else if NAME_RE does not match name, push "name contains invalid characters or starts/ends with a hyphen"
  //    Else if name includes "--", push "name contains consecutive hyphens"
  // 3. If name !== dirName, push "name 'X' does not match directory name 'Y'"
  // 4. If description is empty, push "description is empty"
  //    Else if description length > 1024, push "description exceeds 1024 chars (N)"
  // 5. If compatibility is defined and its length > 500, push "compatibility exceeds 500 chars (N)"
  // 6. Return errors
  throw new Error("Not implemented");
}

/**
 * Parse a minimal YAML frontmatter block without external dependencies.
 * Handles scalar strings, quoted strings, and YAML block scalars (> folded).
 */
function parseFrontmatter(block: string): Record<string, unknown> {
  // TODO:
  // 1. Initialize `result: Record<string, unknown> = {}`
  // 2. Split block into lines, initialize i = 0
  // 3. While i < lines.length:
  //       a. Skip blank lines
  //       b. Match key-value: /^(\w[\w-]*):\s*(.*)$/ on the trimmed line
  //          - If no match, increment i and continue
  //       c. key = match[1], rawVal = match[2].trim()
  //       d. If rawVal === ">":  (folded block scalar)
  //            - Collect all indented continuation lines (start with space or tab)
  //            - Join with " " and trim to get the folded string value
  //            - Assign result[key] = foldedValue; continue
  //       e. If rawVal starts with '"' or "'": strip the surrounding quotes, assign result[key] = stripped; increment i; continue
  //       f. Otherwise: assign result[key] = rawVal; increment i; continue
  // 4. Return result
  throw new Error("Not implemented");
}

export function loadSkills(skillsDir: string): SkillMetadata[] {
  // TODO:
  // 1. Initialize `skills: SkillMetadata[] = []`
  // 2. If skillsDir does not exist (fs.existsSync), return skills
  // 3. Read and sort the entries in skillsDir (fs.readdirSync)
  // 4. For each entry:
  //       a. Build the full skill directory path
  //       b. Skip if it is not a directory (fs.statSync(...).isDirectory())
  //       c. Build the SKILL.md path; skip with console.warn if it does not exist
  //       d. Read SKILL.md content; skip with console.warn if it does not start with "---"
  //       e. Find the closing "---" (search from index 3); skip with console.warn on error
  //       f. Parse the frontmatter block using parseFrontmatter()
  //       g. Extract name (string), description (string, trimmed), compatibility (string | undefined)
  //       h. Call validate(); if errors exist, skip with console.warn listing them
  //       i. Parse allowed-tools: if string split on spaces, if array use as-is, else null
  //       j. Push a SkillMetadata object into skills
  // 5. Return skills
  throw new Error("Not implemented");
}
