import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import Anthropic from "@anthropic-ai/sdk";

import { ANTHROPIC_API_KEY } from "../commons";

const SKILLS_VERSION = "skills-2025-10-02";

function filesFromDir(skillDir: string): Array<File> {
  //TODO:
  // 1. Initialize `results: File[] = []`
  // 2. Compute `parentDir = path.dirname(skillDir)` — used as the base for relative paths,
  //    so files are named "style-guide/SKILL.md" (skill folder name is included)
  // 3. Define a recursive `walk(dir)` function that uses `fs.readdirSync(dir, { withFileTypes: true })`:
  //       a. For each entry, compute `fullPath = path.join(dir, entry.name)`
  //       b. If entry.isDirectory(), recursively call walk(fullPath)
  //       c. Else: compute `relativePath = path.relative(parentDir, fullPath)`,
  //          read with `fs.readFileSync(fullPath)` into `buf`, infer MIME by extension:
  //              .ts / .js  → "text/plain"
  //              .md        → "text/markdown"
  //              .json      → "application/json"
  //              other      → "application/octet-stream"
  //          Push `new File([buf], relativePath, { type: mimeType })` to results
  // 4. Call walk(skillDir), then return results
  throw new Error("Not implemented");
}

async function getOrCreateSkill(skillTitle: string, skillDir: string, client: Anthropic): Promise<string> {
  //TODO:
  // 1. Get `betaClient = client.beta` (typed access to beta endpoints)
  // 2. Call await betaClient.skills.list({ source: "custom", betas: [SKILLS_VERSION] }), assign to skills, print it
  // 3. Iterate over skills.data; for each skill print skill.display_title;
  //    if skill.display_title === skillTitle, print `Skill already exists: ${skill.id} (latest version: ${skill.latest_version})`
  //    and return skill.id
  // 4. Call filesFromDir(skillDir), assign to `files`
  // 5. Call await betaClient.skills.create({ display_title: skillTitle, files, betas: [SKILLS_VERSION] }), assign to skill
  // 6. Print `Skill uploaded: ${skill.id}`, return skill.id
  throw new Error("Not implemented");
}

async function deleteSkills(client: Anthropic): Promise<void> {
  //TODO:
  // 1. Get `betaClient = client.beta`
  // 2. Call await betaClient.skills.list({ source: "custom", betas: [SKILLS_VERSION] }), assign to skills
  // 3. Iterate over skills.data:
  //       a. Call await betaClient.skills.versions.list(skill.id, { betas: [SKILLS_VERSION] }), assign to versions
  //       b. For each v in versions.data, call await betaClient.skills.versions.delete(v.version, { skill_id: skill.id, betas: [SKILLS_VERSION] })
  //          and print `Deleted version ${v.version} of ${skill.display_title}`
  //       c. Call await betaClient.skills.delete(skill.id, { betas: [SKILLS_VERSION] })
  //          and print `Deleted skill ${skill.display_title}`
  throw new Error("Not implemented");
}

function chat(client: Anthropic, skillId: string, logRequest = true, logResponse = true): void {
  //TODO:
  // 1. Create readline interface: `rl = readline.createInterface({ input: process.stdin, output: process.stdout })`
  // 2. Initialize `messages: Anthropic.MessageParam[] = []` and `containerId: string | undefined`
  // 3. Print "\nStyle Guide Agent is ready. Ask it to write, rewrite, or review any text."
  //    and "Type 'exit' to quit.\n"
  // 4. Define recursive `prompt()` callback that calls `rl.question("You: ", async (userInput) => { ... })`:
  //       a. Trim userInput; if userInput.toLowerCase() === "exit", call rl.close() and return
  //       b. Push { role: "user", content: userInput } to messages
  //       c. Build container: { skills: [{ type: "custom", skill_id: skillId, version: "latest" }] }
  //          If containerId is set, add container.id = containerId
  //       d. Build requestPayload: model="claude-sonnet-4-6", max_tokens=4096, messages, container,
  //          betas=["code-execution-2025-08-25", SKILLS_VERSION],
  //          tools=[{ type: "code_execution_20250825", name: "code_execution" }]
  //       e. If logRequest, print "\n--- REQUEST ---", JSON.stringify(requestPayload, null, 2),
  //          and "---------------\n"
  //       f. Call `await client.beta.messages.create(requestPayload as any)`, assign to response
  //       g. If logResponse, print "\n--- RESPONSE ---", JSON.stringify(response, null, 2),
  //          and "----------------\n"; else filter response.content blocks where b.text is defined,
  //          map to b.text, join with " ", and print `\nClaude: ${reply}\n`
  //       h. If response.container exists, update containerId = response.container.id
  //       i. Push { role: "assistant", content: response.content as Anthropic.ContentBlockParam[] } to messages
  //       j. Recursively call prompt() to read the next input
  // 5. Call prompt() once to start the loop
  throw new Error("Not implemented");
}

const STYLE_SKILL_TITLE = "style-guide";
const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_TITLE);

const CALCULATOR_SKILL_TITLE = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_TITLE);

async function main(): Promise<void> {
  //TODO:
  // 1. Create new Anthropic({ apiKey: ANTHROPIC_API_KEY }), assign to client
  // 2. Call getOrCreateSkill(CALCULATOR_SKILL_TITLE, CALCULATOR_SKILL_DIR, client), assign to skillId
  //    (Switch to STYLE_SKILL_TITLE/STYLE_SKILL_DIR to test the style-guide skill instead.)
  // 3. Call chat(client, skillId)
  // 4. (Optional) Call await deleteSkills(client) after the chat session ends to clean up uploaded skills
  throw new Error("Not implemented");
}

main();
