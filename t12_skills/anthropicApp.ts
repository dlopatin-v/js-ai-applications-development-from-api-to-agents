import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "../commons/constants.js";

const SKILLS_VERSION = "skills-2025-10-02";

function filesFromDir(skillDir: string): Array<File> {
  const results: Array<File> = [];
  // Use parent of skillDir as the base for relative paths,
  // so files are named "style-guide/SKILL.md" (matching Python's anthropic.lib.files_from_dir)
  const parentDir = path.dirname(skillDir);

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const relativePath = path.relative(parentDir, fullPath);
        const buf = fs.readFileSync(fullPath);
        const mimeType = entry.name.endsWith(".ts")
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skills = await (client.beta as any).skills.list({ source: "custom", betas: [SKILLS_VERSION] });
  console.log(skills);
  for (const skill of skills.data) {
    console.log(skill.display_title);
    if (skill.display_title === skillTitle) {
      console.log(`Skill already exists: ${skill.id} (latest version: ${skill.latest_version})`);
      return skill.id;
    }
  }

  const files = filesFromDir(skillDir);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skill = await (client.beta as any).skills.create({
    display_title: skillTitle,
    files,
    betas: [SKILLS_VERSION],
  });

  console.log(`Skill uploaded: ${skill.id}`);
  return skill.id;
}

async function deleteSkills(client: Anthropic): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skills = await (client.beta as any).skills.list({ source: "custom", betas: [SKILLS_VERSION] });
  for (const skill of skills.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const versions = await (client.beta as any).skills.versions.list(skill.id, { betas: [SKILLS_VERSION] });
    for (const v of versions.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (client.beta as any).skills.versions.delete(v.version, { skill_id: skill.id, betas: [SKILLS_VERSION] });
      console.log(`Deleted version ${v.version} of ${skill.display_title}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client.beta as any).skills.delete({ skill_id: skill.id, betas: [SKILLS_VERSION] });
    console.log(`Deleted skill ${skill.display_title}`);
  }
}

function chat(client: Anthropic, skillId: string, logRequest = true, logResponse = true): void {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [];
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const container: any = {
        skills: [{ type: "custom", skill_id: skillId, version: "latest" }],
      };
      if (containerId) {
        container.id = containerId;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestPayload: any = {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await (client.beta as any).messages.create(requestPayload);

      if (logResponse) {
        console.log("\n--- RESPONSE ---");
        console.log(JSON.stringify(response, null, 2));
        console.log("----------------\n");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reply = (response.content as any[])
          .filter((b) => b.text !== undefined)
          .map((b) => b.text)
          .join(" ");
        console.log(`\nClaude: ${reply}\n`);
      }

      if (response.container) {
        containerId = response.container.id;
      }

      messages.push({ role: "assistant", content: response.content });

      prompt();
    });
  };

  prompt();
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
