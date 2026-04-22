import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

export interface McpToolModel {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface SkillMetadata {
  name: string;
  description: string;
  skillDir: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowedTools?: string[];
}

const NAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$|^[a-z0-9]$/;

function validate(
  name: string,
  description: string,
  compatibility: string | undefined,
  dirName: string
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

export function loadSkills(skillsDir: string): SkillMetadata[] {
  const skills: SkillMetadata[] = [];

  if (!fs.existsSync(skillsDir)) {
    console.warn(`WARN: skills directory not found: ${skillsDir}`);
    return skills;
  }

  const entries = fs.readdirSync(skillsDir).sort();

  for (const entry of entries) {
    const skillDir = path.join(skillsDir, entry);
    const stat = fs.statSync(skillDir);
    if (!stat.isDirectory()) continue;

    const skillMdPath = path.join(skillDir, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) {
      console.warn(`WARN: skipping '${entry}' — no SKILL.md`);
      continue;
    }

    const content = fs.readFileSync(skillMdPath, "utf-8");
    if (!content.startsWith("---")) {
      console.warn(`WARN: skipping '${entry}' — missing YAML frontmatter`);
      continue;
    }

    let fm: Record<string, unknown>;
    try {
      const end = content.indexOf("---", 3);
      fm = (yaml.load(content.slice(3, end)) as Record<string, unknown>) || {};
    } catch (e) {
      console.warn(`WARN: skipping '${entry}' — frontmatter parse error: ${e}`);
      continue;
    }

    const name = String(fm["name"] ?? "");
    const description = String(fm["description"] ?? "").trim();
    const compatibility =
      fm["compatibility"] != null ? String(fm["compatibility"]).trim() : undefined;

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
      skillDir,
      license: fm["license"] != null ? String(fm["license"]) : undefined,
      compatibility,
      metadata: fm["metadata"] as Record<string, string> | undefined,
      allowedTools,
    });
  }

  return skills;
}
