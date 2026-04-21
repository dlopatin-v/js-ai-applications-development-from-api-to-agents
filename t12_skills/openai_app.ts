import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import * as readline from "readline";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../commons/constants.js";

function zipSkill(skillDir: string): Buffer {
  // TODO
}

async function getOrCreateSkill(skillName: string, skillDir: string, client: OpenAI): Promise<string> {
  // TODO
}

function chat(client: OpenAI, skillId: string, logRequest = true, logResponse = true): void {
  // TODO
}

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
