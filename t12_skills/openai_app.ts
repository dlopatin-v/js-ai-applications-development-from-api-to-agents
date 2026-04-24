import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import * as readline from "readline";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../commons/constants.js";

function zipSkill(skillDir: string): Buffer {
  //TODO:
  // 1. Create a temp directory with os.mkdtempSync
  // 2. Use execSync("zip -r <dest> .") in skillDir to create a zip archive
  // 3. Read the resulting zip file with fs.readFileSync and return the Buffer
  throw new Error("Not implemented");
}

async function getOrCreateSkill(skillName: string, skillDir: string, client: OpenAI): Promise<string> {
  //TODO:
  // 1. Call (client as any).skills.list(), assign to existing
  // 2. Iterate over existing.data; if skill.name === skillName, print and return skill.id
  // 3. Call zipSkill(skillDir), assign to buffer
  // 4. Call (client as any).skills.create({ files: [new File([buffer], `${skillName}.zip`, { type: "application/zip" })] })
  // 5. Print "Skill uploaded: {skill.id}", return skill.id
  throw new Error("Not implemented");
}

function chat(client: OpenAI, skillId: string, logRequest = true, logResponse = true): void {
  //TODO:
  // 1. Initialize previousResponseId = null
  // 2. Print agent ready message
  // 3. Start readline loop:
  //       a. Read user input; break on "exit"
  //       b. Build environment: { type: "container_auto", skills: [{ type: "skill_reference", skill_id: skillId }] }
  //       c. Build requestPayload: model="gpt-5.2", input=[{ role: "user", content: userInput }],
  //          tools=[{ type: "shell", environment }]
  //          If previousResponseId is set, add it to requestPayload
  //       d. If logRequest, print request payload as JSON
  //       e. Call (client.responses as any).create(requestPayload), assign to response
  //       f. Update previousResponseId = response.id
  //       g. If logResponse, print full response JSON; else print response.output_text
  throw new Error("Not implemented");
}

async function deleteSkills(client: OpenAI): Promise<void> {
  //TODO:
  // 1. Call (client as any).skills.list(), assign to skills
  // 2. For each skill, call (client as any).skills.delete(skill.id), print confirmation
  throw new Error("Not implemented");
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// const STYLE_SKILL_NAME = "style-guide";
// const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_NAME);

const CALCULATOR_SKILL_NAME = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_NAME);

async function main(): Promise<void> {
  //TODO:
  // 1. Create new OpenAI({ apiKey: OPENAI_API_KEY }), assign to client
  // 2. Call getOrCreateSkill(CALCULATOR_SKILL_NAME, CALCULATOR_SKILL_DIR, client), assign to skillId
  // 3. Call chat(client, skillId)
  // 4. Optionally call deleteSkills(client) for cleanup after session
  throw new Error("Not implemented");
}

main();
