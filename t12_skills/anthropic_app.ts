import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import Anthropic from "@anthropic-ai/sdk";

import { ANTHROPIC_API_KEY } from "../commons";

const SKILLS_VERSION = "skills-2025-10-02";

function filesFromDir(skillDir: string): File[] {
  const results: File[] = [];
  // Use parent of skillDir as the base for relative paths,
  // so files are named "style-guide/SKILL.md"
  const parentDir = path.dirname(skillDir);

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const relativePath = path.relative(parentDir, fullPath);
        const buf = fs.readFileSync(fullPath);
        const mimeType = entry.name.endsWith(".ts") || entry.name.endsWith(".js")
          ? "text/plain"
          : entry.name.endsWith(".md")
            ? "text/markdown"
            : entry.name.endsWith(".json")
              ? "application/json"
              : "application/octet-stream";
        results.push(new File([buf], relativePath, { type: mimeType }));
      }
    }
  }

  walk(skillDir);
  return results;
}

async function getOrCreateSkill(skillTitle: string, skillDir: string, client: Anthropic): Promise<string> {
  const betaClient = client.beta;
  const skills = await betaClient.skills.list({ source: "custom", betas: [SKILLS_VERSION] });
  console.log(skills);
  for (const skill of skills.data) {
    console.log(skill.display_title);
    if (skill.display_title === skillTitle) {
      console.log(`Skill already exists: ${skill.id} (latest version: ${skill.latest_version})`);
      return skill.id;
    }
  }

  const files = filesFromDir(skillDir);

  const skill = await betaClient.skills.create({
    display_title: skillTitle,
    files,
    betas: [SKILLS_VERSION],
  });

  console.log(`Skill uploaded: ${skill.id}`);
  return skill.id;
}

async function deleteSkills(client: Anthropic): Promise<void> {
  const betaClient = client.beta;
  const skills = await betaClient.skills.list({ source: "custom", betas: [SKILLS_VERSION] });
  for (const skill of skills.data) {
    const versions = await betaClient.skills.versions.list(skill.id, { betas: [SKILLS_VERSION] });
    for (const v of versions.data) {
      await betaClient.skills.versions.delete(v.version, { skill_id: skill.id, betas: [SKILLS_VERSION] });
      console.log(`Deleted version ${v.version} of ${skill.display_title}`);
    }
    await betaClient.skills.delete(skill.id, { betas: [SKILLS_VERSION] });
    console.log(`Deleted skill ${skill.display_title}`);
  }
}

function chat(client: Anthropic, skillId: string, logRequest = true, logResponse = true): void {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const messages: Anthropic.MessageParam[] = [];
  let containerId: string | undefined;

  console.log("\nStyle Guide Agent is ready. Ask it to write, rewrite, or review any text.");
  console.log("Type 'exit' to quit.\n");

  const prompt = (): void => {
    rl.question("You: ", async (userInput) => {
      userInput = userInput.trim();
      if (userInput.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      messages.push({ role: "user", content: userInput });

      const container: { skills: { type: "custom"; skill_id: string; version: string }[]; id?: string } = {
        skills: [{ type: "custom", skill_id: skillId, version: "latest" }],
      };
      if (containerId) {
        container.id = containerId;
      }

      const requestPayload = {
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages,
        container,
        betas: ["code-execution-2025-08-25", SKILLS_VERSION],
        tools: [{ type: "code_execution_20250825", name: "code_execution" }],
      };

      if (logRequest) {
        console.log("\n--- REQUEST ---");
        console.log(JSON.stringify(requestPayload, null, 2));
        console.log("---------------\n");
      }

      const betaClient = client.beta;
      const response = await betaClient.messages.create(requestPayload as any);

      if (logResponse) {
        console.log("\n--- RESPONSE ---");
        console.log(JSON.stringify(response, null, 2));
        console.log("----------------\n");
      } else {
        const reply = (response.content as { type: string; text?: string }[])
          .filter((b) => b.text !== undefined)
          .map((b) => b.text)
          .join(" ");
        console.log(`\nClaude: ${reply}\n`);
      }

      if (response.container) {
        containerId = response.container.id;
      }

      messages.push({ role: "assistant", content: response.content as Anthropic.ContentBlockParam[] });

      prompt();
    });
  };

  prompt();
}

// const STYLE_SKILL_TITLE = "style-guide";
// const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_TITLE);

const CALCULATOR_SKILL_TITLE = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_TITLE);

async function main(): Promise<void> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const skillId = await getOrCreateSkill(CALCULATOR_SKILL_TITLE, CALCULATOR_SKILL_DIR, client);
  chat(client, skillId);
  // Note: deleteSkills is called after chat() exits (on readline close)
  // For cleanup after session, uncomment:
  // await deleteSkills(client);
}

main();
