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
  // TODO
}

/**
 * Parse a minimal YAML frontmatter block without external dependencies.
 * Handles scalar strings, quoted strings, and YAML block scalars (> folded).
 */
function parseFrontmatter(block: string): Record<string, unknown> {
  // TODO
}

export function loadSkills(skillsDir: string): SkillMetadata[] {
  // TODO
}
