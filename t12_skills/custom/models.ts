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
    // Match key: value
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)/);
    if (!m) { i++; continue; }

    const key = m[1];
    const rest = m[2].trim();

    if (rest === ">") {
      // Folded block scalar — collect indented continuation lines
      const parts: string[] = [];
      i++;
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i].trim() === "")) {
        parts.push(lines[i].trim());
        i++;
      }
      result[key] = parts.join(" ").trim();
    } else if (rest === "") {
      // Mapping value — parse sub-keys
      const subObj: Record<string, string> = {};
      i++;
      while (i < lines.length && lines[i].match(/^\s+[a-zA-Z0-9_-]+:/)) {
        const subM = lines[i].trim().match(/^([a-zA-Z0-9_-]+):\s*(.*)/);
        if (subM) subObj[subM[1]] = subM[2].replace(/^["']|["']$/g, "").trim();
        i++;
      }
      result[key] = subObj;
    } else {
      // Scalar — strip optional surrounding quotes
      result[key] = rest.replace(/^["']|["']$/g, "");
      i++;
    }
  }
  return result;
}

export function loadSkills(skillsDir: string): SkillMetadata[] {
  const skills: SkillMetadata[] = [];

  if (!fs.existsSync(skillsDir) || !fs.statSync(skillsDir).isDirectory()) {
    return skills;
  }

  const entries = fs.readdirSync(skillsDir).sort();
  for (const entry of entries) {
    const skillDir = path.join(skillsDir, entry);
    if (!fs.statSync(skillDir).isDirectory()) continue;

    const skillMd = path.join(skillDir, "SKILL.md");
    if (!fs.existsSync(skillMd)) {
      console.warn(`WARN: skipping '${entry}' — no SKILL.md`);
      continue;
    }

    const content = fs.readFileSync(skillMd, "utf-8");
    if (!content.startsWith("---")) {
      console.warn(`WARN: skipping '${entry}' — missing YAML frontmatter`);
      continue;
    }

    let fm: Record<string, unknown>;
    try {
      const endIdx = content.indexOf("---", 3);
      if (endIdx === -1) throw new Error("closing --- not found");
      fm = parseFrontmatter(content.slice(3, endIdx));
    } catch (e) {
      console.warn(`WARN: skipping '${entry}' — frontmatter parse error: ${(e as Error).message}`);
      continue;
    }

    const name = String(fm["name"] ?? "");
    const description = String(fm["description"] ?? "").trim();
    const compatibility = fm["compatibility"] ? String(fm["compatibility"]).trim() : undefined;

    const errors = validate(name, description, compatibility, entry);
    if (errors.length > 0) {
      console.warn(`WARN: skipping '${entry}' — ${errors.join("; ")}`);
      continue;
    }

    let allowedTools: string[] | undefined;
    const rawAt = fm["allowed-tools"];
    if (typeof rawAt === "string") {
      allowedTools = rawAt.split(/\s+/).filter(Boolean) || undefined;
    } else if (Array.isArray(rawAt)) {
      allowedTools = rawAt.length > 0 ? rawAt : undefined;
    }

    skills.push({
      name,
      description,
      skillDir,
      license: fm["license"] ? String(fm["license"]) : undefined,
      compatibility,
      metadata: fm["metadata"] as Record<string, string> | undefined,
      allowedTools,
    });
  }

  return skills;
}
