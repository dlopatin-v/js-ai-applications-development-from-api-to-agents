import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "../commons/constants.js";

const SKILLS_VERSION = "skills-2025-10-02";

function filesFromDir(skillDir: string): Array<File> {
  //TODO:
  // 1. Use fs.readdirSync to list files in skillDir
  // 2. For each file, read with fs.readFileSync; infer MIME from extension
  //    (".md" → "text/markdown", others → "text/plain")
  // 3. Use path.relative(path.dirname(skillDir), fullPath) as the File name
  // 4. Create each entry as new File([buf], relativePath, { type: mimeType })
  // 5. Return the array of File objects
  throw new Error("Not implemented");
}

async function getOrCreateSkill(skillTitle: string, skillDir: string, client: Anthropic): Promise<string> {
  //TODO:
  // 1. Call (client.beta as any).skills.list({ source: "custom", betas: [SKILLS_VERSION] }), print result
  // 2. Iterate over skills.data; if skill.display_title === skillTitle, print and return skill.id
  // 3. Gather files with filesFromDir(skillDir)
  // 4. Call (client.beta as any).skills.create({ display_title: skillTitle, files, betas: [SKILLS_VERSION] })
  // 5. Print f"Skill uploaded: {skill.id}", return skill.id
  throw new Error("Not implemented");
}

async function deleteSkills(client: Anthropic): Promise<void> {
  //TODO:
  // 1. Call (client.beta as any).skills.list({ source: "custom", betas: [SKILLS_VERSION] })
  // 2. For each skill:
  //       a. List versions with (client.beta as any).skills.versions.list(skill.id, { betas: [SKILLS_VERSION] })
  //       b. Delete each version; then delete the skill itself
  //       c. Print confirmation for each deletion
  throw new Error("Not implemented");
}

function chat(client: Anthropic, skillId: string, logRequest = true, logResponse = true): void {
  //TODO:
  // 1. Initialize messages = [] and containerId = null
  // 2. Print agent ready message
  // 3. Start readline loop:
  //       a. Read user input; break on "exit"
  //       b. Append { role: "user", content: userInput } to messages
  //       c. Build container = { skills: [{ type: "custom", skill_id: skillId, version: "latest" }] }
  //          If containerId is set, add container.id = containerId
  //       d. Build requestPayload: model="claude-sonnet-4-6", max_tokens=4096, messages, container,
  //          betas=["code-execution-2025-08-25", SKILLS_VERSION],
  //          tools=[{ type: "code_execution_20250825", name: "code_execution" }]
  //       e. If logRequest, print request payload as JSON
  //       f. Call (client.beta as any).messages.create(requestPayload), assign to response
  //       g. If logResponse, print full response JSON; else print text blocks
  //       h. If response.container exists, update containerId = response.container.id
  //       i. Append { role: "assistant", content: response.content } to messages
  throw new Error("Not implemented");
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const STYLE_SKILL_TITLE = "style-guide";
const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_TITLE);

// const CALCULATOR_SKILL_TITLE = "calculator";
// const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_TITLE);

async function main(): Promise<void> {
  //TODO:
  // 1. Create new Anthropic({ apiKey: ANTHROPIC_API_KEY }), assign to client
  // 2. Call getOrCreateSkill(STYLE_SKILL_TITLE, STYLE_SKILL_DIR, client), assign to skillId
  // 3. Call chat(client, skillId)
  // 4. Optionally call deleteSkills(client) for cleanup after session
  throw new Error("Not implemented");
}

main();
