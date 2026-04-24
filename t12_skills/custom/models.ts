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
  const errors: string[] = [];

  if (!name) {
    errors.push("name is empty");
  } else if (name.length > 64) {
    errors.push(`name exceeds 64 chars (${name.length})`);
  } else if (!NAME_RE.test(name)) {
    errors.push("name contains invalid characters or starts/ends with a hyphen");
  } else if (name.includes("--")) {
    errors.push("name contains consecutive hyphens");
  }

  if (name !== dirName) {
    errors.push(`name '${name}' does not match directory name '${dirName}'`);
  }

  if (!description) {
    errors.push("description is empty");
  } else if (description.length > 1024) {
    errors.push(`description exceeds 1024 chars (${description.length})`);
  }

  if (compatibility !== undefined && compatibility.length > 500) {
    errors.push(`compatibility exceeds 500 chars (${compatibility.length})`);
  }

  return errors;
}

/**
 * Parse a minimal YAML frontmatter block without external dependencies.
 * Handles scalar strings, quoted strings, and YAML block scalars (> folded).
 */
function parseFrontmatter(block: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = block.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const match = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!match) { i++; continue; }

    const key = match[1];
    const rawVal = match[2].trim();

    if (rawVal === ">") {
      // Folded block scalar: collect indented continuation lines
      const chunks: string[] = [];
      i++;
      while (i < lines.length && (lines[i].startsWith(" ") || lines[i].startsWith("\t"))) {
        chunks.push(lines[i].trim());
        i++;
      }
      result[key] = chunks.join(" ").trim();
      continue;
    }

    if (rawVal.startsWith('"') || rawVal.startsWith("'")) {
      result[key] = rawVal.slice(1, -1);
      i++;
      continue;
    }

    result[key] = rawVal;
    i++;
  }

  return result;
}

export function loadSkills(skillsDir: string): SkillMetadata[] {
  const skills: SkillMetadata[] = [];

  if (!fs.existsSync(skillsDir)) return skills;

  const entries = fs.readdirSync(skillsDir).sort();

  for (const entry of entries) {
    const skillDirPath = path.join(skillsDir, entry);
    if (!fs.statSync(skillDirPath).isDirectory()) continue;

    const skillMdPath = path.join(skillDirPath, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) {
      console.warn(`WARN: skipping '${entry}' — no SKILL.md`);
      continue;
    }

    const content = fs.readFileSync(skillMdPath, "utf-8");
    if (!content.startsWith("---")) {
      console.warn(`WARN: skipping '${entry}' — missing YAML frontmatter`);
      continue;
    }

    const endIdx = content.indexOf("---", 3);
    if (endIdx === -1) {
      console.warn(`WARN: skipping '${entry}' — unclosed frontmatter`);
      continue;
    }

    const fm = parseFrontmatter(content.slice(3, endIdx));

    const name = String(fm["name"] ?? "");
    const description = String(fm["description"] ?? "").trim();
    const compatibility = fm["compatibility"] !== undefined
      ? String(fm["compatibility"]).trim()
      : undefined;

    const errors = validate(name, description, compatibility, entry);
    if (errors.length > 0) {
      console.warn(`WARN: skipping '${entry}' — ${errors.join("; ")}`);
      continue;
    }

    const rawAt = fm["allowed-tools"];
    let allowedTools: string[] | undefined;
    if (typeof rawAt === "string") {
      allowedTools = rawAt.split(/\s+/).filter(Boolean) || undefined;
    } else if (Array.isArray(rawAt)) {
      allowedTools = rawAt.length > 0 ? rawAt : undefined;
    }

    skills.push({
      name,
      description,
      skillDir: skillDirPath,
      license: fm["license"] !== undefined ? String(fm["license"]) : undefined,
      compatibility,
      metadata: fm["metadata"] as Record<string, string> | undefined,
      allowedTools,
    });
  }

  return skills;
}
