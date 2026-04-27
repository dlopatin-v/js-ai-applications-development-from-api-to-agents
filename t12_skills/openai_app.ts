import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";

import OpenAI from "openai";

import { OPENAI_API_KEY } from "../commons/constants"

function zipSkill(skillDir: string): Buffer {
  //TODO:
  // 1. Create a temp directory with os.mkdtempSync, assign to tmpDir
  // 2. Build destZip = path.join(tmpDir, "skill.zip")
  // 3. Use execSync(`zip -r ${destZip} .`, { cwd: skillDir }) to zip the skill directory
  // 4. Read the resulting zip with fs.readFileSync(destZip) and return the Buffer
  throw new Error("Not implemented");
}

async function getOrCreateSkill(skillName: string, skillDir: string, client: OpenAI): Promise<string> {
  //TODO:
  // 1. Call (client as any).skills.list(), assign to existing
  // 2. Iterate over existing.data; if skill.name === skillName,
  //    print `Skill already exists: ${skill.id}` and return skill.id
  // 3. Call zipSkill(skillDir), assign to buffer
  // 4. Call (client as any).skills.create({ files: [new File([buffer], `${skillName}.zip`, { type: "application/zip" })] }),
  //    assign to skill
  // 5. Print `Skill uploaded: ${skill.id}`, return skill.id
  throw new Error("Not implemented");
}

function chat(client: OpenAI, skillId: string, logRequest = true, logResponse = true): void {
  //TODO:
  // 1. Initialize previousResponseId = null
  // 2. Print "\nAgent is ready. Type your query or 'exit' to quit.\n"
  // 3. Start readline loop:
  //       a. Read user input with prompt "You: "; break on "exit"
  //       b. Build environment: { type: "container_auto", skills: [{ type: "skill_reference", skill_id: skillId }] }
  //       c. Build requestPayload: model="gpt-5.2", input=[{ role: "user", content: userInput }],
  //          tools=[{ type: "shell", environment }]
  //          If previousResponseId is set, add previous_response_id to requestPayload
  //       d. If logRequest, print "\n--- REQUEST ---", JSON.stringify(requestPayload, null, 2),
  //          and "---------------\n"
  //       e. Call await (client.responses as any).create(requestPayload), assign to response
  //       f. Assign previousResponseId = response.id
  //       g. If logResponse, print "\n--- RESPONSE ---", JSON.stringify(response, null, 2),
  //          and "----------------\n"; else print `\nGPT: ${response.output_text}\n`
  throw new Error("Not implemented");
}

async function deleteSkills(client: OpenAI): Promise<void> {
  //TODO:
  // 1. Call (client as any).skills.list(), assign to skills
  // 2. Iterate over skills.data, call (client as any).skills.delete(skill.id),
  //    print `Deleted skill ${skill.name}`
  throw new Error("Not implemented");
}

const STYLE_SKILL_NAME = "style-guide";
const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_NAME);

const CALCULATOR_SKILL_NAME = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_NAME);

async function main(): Promise<void> {
  //TODO:
  // 1. Create new OpenAI({ apiKey: OPENAI_API_KEY }), assign to client
  // 2. Call getOrCreateSkill(CALCULATOR_SKILL_NAME, CALCULATOR_SKILL_DIR, client), assign to skillId
  // 3. Call chat(client, skillId)
  // 4. Call deleteSkills(client)
  throw new Error("Not implemented");
}

main();
