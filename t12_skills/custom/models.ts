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

/**
 * Validate a skill's metadata fields against the agentskills.io spec rules.
 * @param name - Skill name (must match dirName, max 64 chars, lowercase kebab-case).
 * @param description - Skill description (max 1024 chars, non-empty).
 * @param compatibility - Optional compatibility string (max 500 chars).
 * @param dirName - The directory name the skill lives in (name must match).
 * @returns Array of error strings; empty array means valid.
 * Hint: check length limits, NAME_RE pattern, no consecutive hyphens, name === dirName.
 */
function validate(
  name: string,
  description: string,
  compatibility: string | undefined,
  dirName: string,
): string[] {
  // TODO
}

/**
 * Parse a minimal YAML frontmatter block without external dependencies.
 * Handles scalar strings, quoted strings, and YAML block scalars (> folded).
 * @param block - Raw string content between the opening and closing `---` markers.
 * @returns Parsed key-value object.
 * Hint: iterate lines; match `key: value`; handle ">" folded block scalars (collect
 * indented lines), empty-value mappings (sub-keys), and plain/quoted scalars.
 */
function parseFrontmatter(block: string): Record<string, unknown> {
  // TODO
}

/**
 * Scan `skillsDir` and load all valid skills found in immediate subdirectories.
 * @param skillsDir - Absolute path to the skills root folder.
 * @returns Array of SkillMetadata for every valid skill found.
 * Hint: for each subdirectory read SKILL.md, extract the `---` frontmatter block,
 * call parseFrontmatter(), validate(), then build and push a SkillMetadata object.
 * Warn (console.warn) and skip any skill that fails any check.
 * Parse `allowed-tools` as a whitespace-separated string or array.
 */
export function loadSkills(skillsDir: string): SkillMetadata[] {
  // TODO
}
