import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import * as readline from "readline";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../commons/constants.js";

/**
 * Creates an in-memory zip archive from all files in a skill directory.
 * @param skillDir - Absolute path to the directory to zip.
 * @returns A Buffer containing the zip archive bytes.
 * Hint: use execSync("zip -r <dest> .") in a temp directory;
 * then fs.readFileSync the resulting zip file.
 */
function zipSkill(skillDir: string): Buffer {
  // TODO
}

/**
 * Uploads a skill to OpenAI if it doesn't already exist, otherwise reuses the existing one.
 * @param skillName - The name identifier for the skill.
 * @param skillDir - Directory containing the skill files to zip and upload.
 * @param client - Authenticated OpenAI client.
 * @returns The skill_id string of the created or existing skill.
 * Hint: list existing skills with client.skills.list();
 * match by name; if not found, zip the skill dir and upload via (client.skills as any).create()
 * passing files as [new File([buffer], filename, { type: "application/zip" })].
 */
async function getOrCreateSkill(skillName: string, skillDir: string, client: OpenAI): Promise<string> {
  // TODO
}

/**
 * Starts an interactive chat loop that uses the given OpenAI skill.
 * @param client - Authenticated OpenAI client.
 * @param skillId - The skill_id to attach to every message request.
 * @param logRequest - Whether to log the request payload.
 * @param logResponse - Whether to log the response payload.
 * Hint: use readline for user input; call (client.responses as any).create with
 * { model: "gpt-5.2", input: [{ role: "user", content }],
 *   tools: [{ type: "shell", environment: { type: "container_auto", skills: [...] } }],
 *   previous_response_id } to chain turns server-side.
 */
function chat(client: OpenAI, skillId: string, logRequest = true, logResponse = true): void {
  // TODO
}

/**
 * Deletes all uploaded OpenAI skills.
 * @param client - Authenticated OpenAI client.
 * Hint: list all skills via client.skills.list(); delete each with client.skills.delete(id).
 */
async function deleteSkills(client: OpenAI): Promise<void> {
  // TODO
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// const STYLE_SKILL_NAME = "style-guide";
// const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_NAME);

const CALCULATOR_SKILL_NAME = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_NAME);

async function main(): Promise<void> {
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const skillId = await getOrCreateSkill(CALCULATOR_SKILL_NAME, CALCULATOR_SKILL_DIR, client);
  chat(client, skillId);
  // Note: deleteSkills is called after chat() exits (on readline close)
  // For cleanup after session, uncomment:
  // await deleteSkills(client);
}

main();
