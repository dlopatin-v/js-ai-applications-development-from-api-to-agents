import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "../commons/constants.js";

const SKILLS_VERSION = "skills-2025-10-02";

/**
 * Reads all files in a skill directory and returns them as tuples for upload.
 * @param skillDir - Absolute path to the skill directory.
 * @returns Array of [filename, fileBuffer, mimeType] tuples for each file.
 * Hint: use fs.readdirSync + fs.readFileSync; infer MIME from extension
 * (e.g. ".md" → "text/markdown", ".ts" → "text/plain").
 */
function filesFromDir(skillDir: string): Array<[string, Buffer, string]> {
  // TODO
}

/**
 * Uploads a skill to Anthropic if it doesn't already exist, otherwise reuses the existing one.
 * @param skillTitle - The display name / title of the skill.
 * @param skillDir - Directory containing the skill files to upload.
 * @param client - Authenticated Anthropic client.
 * @returns The skill_id string of the created or existing skill.
 * Hint: list existing skills with client.beta.files.list({ betas: [SKILLS_VERSION] });
 * match by name; if not found, upload files then create skill via client.beta.skills.create().
 */
async function getOrCreateSkill(skillTitle: string, skillDir: string, client: Anthropic): Promise<string> {
  // TODO
}

/**
 * Deletes all uploaded Anthropic skills and their associated files.
 * @param client - Authenticated Anthropic client.
 * Hint: list all skills; for each skill, delete associated files, then delete the skill.
 */
async function deleteSkills(client: Anthropic): Promise<void> {
  // TODO
}

/**
 * Starts an interactive chat loop that uses the given Anthropic skill.
 * @param client - Authenticated Anthropic client.
 * @param skillId - The skill_id to attach to every message request.
 * @param logRequest - Whether to log the request payload.
 * @param logResponse - Whether to log the response payload.
 * Hint: use readline for user input; call client.beta.messages.create with
 * { betas: [SKILLS_VERSION], model, messages, skills: [{ type: "skill", id: skillId }] }.
 */
function chat(client: Anthropic, skillId: string, logRequest = true, logResponse = true): void {
  // TODO
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const STYLE_SKILL_TITLE = "style-guide";
const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_TITLE);

// const CALCULATOR_SKILL_TITLE = "calculator";
// const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_TITLE);

async function main(): Promise<void> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const skillId = await getOrCreateSkill(STYLE_SKILL_TITLE, STYLE_SKILL_DIR, client);
  chat(client, skillId);
  // Note: deleteSkills is called after chat() exits (on readline close)
  // For cleanup after session, uncomment:
  // await deleteSkills(client);
}

main();
