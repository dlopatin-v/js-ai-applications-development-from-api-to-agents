import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";

import OpenAI from "openai";

import { BlobPart } from "node:buffer";

import { OPENAI_API_KEY } from "../commons"

function zipSkill(skillDir: string): BlobPart {
  //TODO:
  // 1. Build `tmpFile = path.join(os.tmpdir(), \`skill-${Date.now()}.zip\`)`
  //    (writing the zip to the OS temp dir keeps the source skill folder clean)
  // 2. Compute `parentDir = path.dirname(skillDir)` and `dirName = path.basename(skillDir)`
  //    so the zip will contain `<dirName>/SKILL.md` (skill folder name preserved at the zip root)
  //    rather than loose files
  // 3. Run `execSync(\`zip -r "${tmpFile}" "${dirName}"\`, { cwd: parentDir })`
  // 4. Read the resulting zip with `fs.readFileSync(tmpFile)`, assign to `buf`
  // 5. Delete the temp file with `fs.unlinkSync(tmpFile)`
  // 6. Return `buf`
  throw new Error("Not implemented");
}

async function getOrCreateSkill(skillName: string, skillDir: string, client: OpenAI): Promise<string> {
  //TODO:
  // 1. Call `await client.skills.list()`, assign to `existing`
  // 2. Iterate over `existing.data`; if `skill.name === skillName`,
  //    print `Skill already exists: ${skill.id}` and return `skill.id`
  // 3. Call `zipSkill(skillDir)`, assign to `zipBytes`
  // 4. Compute `dirName = path.basename(skillDir)`
  // 5. Build `zipFile = new File([zipBytes], \`${dirName}.zip\`, { type: "application/zip" })`
  // 6. Call `await client.skills.create({ files: [zipFile] })`, assign to `skill`
  // 7. Print `Skill uploaded: ${skill.id}`, return `skill.id`
  throw new Error("Not implemented");
}

function chat(client: OpenAI, skillId: string, logRequest = true, logResponse = true): void {
  //TODO:
  // 1. Create readline interface: `rl = readline.createInterface({ input: process.stdin, output: process.stdout })`
  // 2. Declare `let previousResponseId: string | undefined`
  // 3. Print "\nAgent is ready. Type your query or 'exit' to quit.\n"
  // 4. Define recursive `prompt()` callback that calls `rl.question("You: ", async (userInput) => { ... })`:
  //       a. Trim userInput; if userInput.toLowerCase() === "exit", call `rl.close()` and return
  //       b. Build environment:
  //            { type: "container_auto",
  //              skills: [{ type: "skill_reference", skill_id: skillId }] }
  //       c. Build `requestPayload: any` with model="gpt-5.2",
  //          input=[{ role: "user", content: userInput }],
  //          tools=[{ type: "shell", environment }]
  //          If previousResponseId is set, add `requestPayload.previous_response_id = previousResponseId`
  //       d. If logRequest, print "\n--- REQUEST ---", JSON.stringify(requestPayload, null, 2),
  //          and "---------------\n"
  //       e. Call `await client.responses.create(requestPayload)`, assign to `response`
  //       f. Update `previousResponseId = response.id`
  //       g. If logResponse, print "\n--- RESPONSE ---", JSON.stringify(response, null, 2),
  //          and "----------------\n"; else print `\nGPT: ${response.output_text}\n`
  //       h. Recursively call `prompt()` to read the next input
  // 5. Call `prompt()` once to start the loop
  throw new Error("Not implemented");
}

async function deleteSkills(client: OpenAI): Promise<void> {
  //TODO:
  // 1. Call `await client.skills.list()`, assign to `skills`
  // 2. Iterate over `skills.data`, call `await client.skills.delete(skill.id)`,
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
  // 2. Call await getOrCreateSkill(CALCULATOR_SKILL_NAME, CALCULATOR_SKILL_DIR, client), assign to skillId
  //    (Switch to STYLE_SKILL_NAME/STYLE_SKILL_DIR to test the style-guide skill instead.)
  // 3. Call chat(client, skillId)
  // 4. (Optional) After the chat session ends, call `await deleteSkills(client)` to clean up
  throw new Error("Not implemented");
}

main();
