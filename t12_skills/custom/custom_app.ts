import * as path from "path";
import * as readline from "readline";

import OpenAI from "openai";
import { OPENAI_API_KEY } from "commons/constants";
import { Message } from "commons/models/message";
import { Role } from "commons/models/role";
import { BaseTool } from "./tools/base.js";
import { SkillMetadata, loadSkills } from "./models.js";
import { ReadSkillTool } from "./tools/skills/read_skill_tool.js";
import { PythonCodeInterpreterTool } from "./tools/pyInterpreter/pythonCodeInterpreterTool.js";
import { T12Agent } from "./agent.js";

const SKILLS_DIR = path.join(__dirname, "_skills");
const MCP_URL = "http://localhost:8050/mcp";
const MCP_TOOL_NAME = "execute_code";

function buildAvailableSkillsXml(skills: SkillMetadata[]): string {
  const parts: string[] = ["<available_skills>"];
  for (const skill of skills) {
    parts.push(`  <skill name="${skill.name}">`);
    parts.push(`    <description>${skill.description}</description>`);
    if (skill.license) parts.push(`    <license>${skill.license}</license>`);
    if (skill.compatibility) parts.push(`    <compatibility>${skill.compatibility}</compatibility>`);
    if (skill.metadata) {
      parts.push("    <metadata>");
      for (const [k, v] of Object.entries(skill.metadata)) {
        parts.push(`      <${k}>${v}</${k}>`);
      }
      parts.push("    </metadata>");
    }
    if (skill.allowedTools) {
      parts.push(`    <allowed-tools>${skill.allowedTools.join(" ")}</allowed-tools>`);
    }
    parts.push("  </skill>");
  }
  parts.push("</available_skills>");
  return parts.join("\n");
}

function buildSystemPrompt(skills: SkillMetadata[]): string {
  return `You are an AI assistant with access to agent skills.

${buildAvailableSkillsXml(skills)}

## How to use skills

When the user's request matches a skill, activate it:
1. Call \`read_skill\` with the skill's SKILL.md path (e.g. path="/<skill-name>/SKILL.md") to load
   its full instructions.
2. Follow the instructions in the loaded SKILL.md precisely.
3. If the instructions reference additional files (scripts, references, assets), read them on demand
   using \`read_skill\` (e.g. path="/<skill-name>/scripts/calculate.ts").
4. If the skill requires running a script, execute it with \`${MCP_TOOL_NAME}\`.

Always read the relevant SKILL.md before performing the task.`;
}

async function main(): Promise<void> {
  const skills = loadSkills(SKILLS_DIR);
  if (skills.length === 0) {
    console.error(`ERROR: no valid skills found in ${SKILLS_DIR}`);
    return;
  }
  console.log(`Loaded ${skills.length} skill(s): ${skills.map((s) => s.name).join(", ")}`);

  const systemPrompt = buildSystemPrompt(skills);
  console.log(`System prompt:\n${systemPrompt}`);

  const messages: Message[] = [new Message(Role.SYSTEM, systemPrompt)];

  const tools: BaseTool[] = [
    new ReadSkillTool(SKILLS_DIR),
    await PythonCodeInterpreterTool.create(MCP_URL, MCP_TOOL_NAME, SKILLS_DIR),
  ];

  const agent = new T12Agent(
    new OpenAI({ apiKey: OPENAI_API_KEY }),
    "gpt-5.2",
    tools,
  );

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const prompt = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));

  console.log("\nAgent is ready. Type your query or 'exit' to quit.\n");

  while (true) {
    const userInput = (await prompt("➡️: ")).trim();
    if (userInput.toLowerCase() === "exit") break;

    messages.push(new Message(Role.USER, userInput));
    const assistantMessage = await agent.chatCompletion(messages, true);
    messages.push(assistantMessage);
  }

  rl.close();
}

main().catch(console.error);
