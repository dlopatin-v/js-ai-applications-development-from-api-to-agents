import { BlobPart } from "node:buffer";
import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";

import OpenAI from "openai";

import { OPENAI_API_KEY } from "../commons/constants.js";

function zipSkill(skillDir: string): BlobPart {
  const tmpFile = path.join(os.tmpdir(), `skill-${Date.now()}.zip`);
  const parentDir = path.dirname(skillDir);
  const dirName = path.basename(skillDir);
  execSync(`zip -r "${tmpFile}" "${dirName}"`, { cwd: parentDir });
  const buf = fs.readFileSync(tmpFile);
  fs.unlinkSync(tmpFile);
  return buf;
}

async function getOrCreateSkill(skillName: string, skillDir: string, client: OpenAI): Promise<string> {
  const existing = await client.skills.list();
  for (const skill of existing.data) {
    if (skill.name === skillName) {
      console.log(`Skill already exists: ${skill.id}`);
      return skill.id;
    }
  }

  const zipBytes = zipSkill(skillDir);
  const dirName = path.basename(skillDir);

  const zipFile = new File([zipBytes], `${dirName}.zip`, { type: "application/zip" });
  const skill = await client.skills.create({
    files: [zipFile],
  });

  console.log(`Skill uploaded: ${skill.id}`);
  return skill.id;
}

function chat(client: OpenAI, skillId: string, logRequest = true, logResponse = true): void {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let previousResponseId: string | undefined;

  console.log("\nAgent is ready. Type your query or 'exit' to quit.\n");

  const prompt = (): void => {
    rl.question("You: ", async (userInput) => {
      userInput = userInput.trim();
      if (userInput.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      const environment = {
        type: "container_auto",
        skills: [
          {
            type: "skill_reference",
            skill_id: skillId,
          },
        ],
      };

      const requestPayload: any = {
        model: "gpt-5.2",
        input: [{ role: "user", content: userInput }],
        tools: [{ type: "shell", environment }],
      };

      if (previousResponseId) {
        requestPayload.previous_response_id = previousResponseId;
      }

      if (logRequest) {
        console.log("\n--- REQUEST ---");
        console.log(JSON.stringify(requestPayload, null, 2));
        console.log("---------------\n");
      }

      const response = await client.responses.create(requestPayload);
      previousResponseId = response.id;

      if (logResponse) {
        console.log("\n--- RESPONSE ---");
        console.log(JSON.stringify(response, null, 2));
        console.log("----------------\n");
      } else {
        console.log(`\nGPT: ${response.output_text}\n`);
      }

      prompt();
    });
  };

  prompt();
}

async function deleteSkills(client: OpenAI): Promise<void> {
  const skills = await client.skills.list();
  for (const skill of skills.data) {
    await client.skills.delete(skill.id);
    console.log(`Deleted skill ${skill.name}`);
  }
}


// const STYLE_SKILL_NAME = "style-guide";
// const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_NAME);

const CALCULATOR_SKILL_NAME = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_NAME);

async function main(): Promise<void> {
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const skillId = await getOrCreateSkill(CALCULATOR_SKILL_NAME, CALCULATOR_SKILL_DIR, client);
  chat(client, skillId);
  await deleteSkills(client);
}

main();
