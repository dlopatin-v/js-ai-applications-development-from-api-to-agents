import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "../commons/constants.js";

const SKILLS_VERSION = "skills-2025-10-02";

function filesFromDir(skillDir: string): Array<[string, Buffer, string]> {
  // TODO
}

async function getOrCreateSkill(skillTitle: string, skillDir: string, client: Anthropic): Promise<string> {
  // TODO
}

async function deleteSkills(client: Anthropic): Promise<void> {
  // TODO
}

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
