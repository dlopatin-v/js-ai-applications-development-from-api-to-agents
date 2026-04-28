import * as path from "path";
import * as readline from "readline";

import OpenAI from "openai";

import { T12Agent } from "./agent";
import { SkillMetadata, loadSkills } from "./models";
import { BaseTool } from "./tools/base";
import { PyCodeInterpreterTool } from "./tools/pyInterpreter/pyCodeInterpreterTool";
import { ReadSkillTool } from "./tools/skills/read_skill_tool";

import { OPENAI_API_KEY, Message, Role } from "../../commons";


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
  const skillsXml = buildAvailableSkillsXml(skills);
  return `You are an AI assistant with access to agent skills.

${skillsXml}

## How to use skills

When the user's request matches a skill, activate it:
1. Call \`read_skill\` with the skill's SKILL.md path (e.g. path="/<skill-name>/SKILL.md") to load
   its full instructions.
2. Follow the instructions in the loaded SKILL.md precisely.
3. If the instructions reference additional files (scripts, references, assets), read them on demand
   using \`read_skill\` (e.g. path="/<skill-name>/scripts/convert.py").
4. If the skill requires running a Python script, execute it with \`${MCP_TOOL_NAME}\`.

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
    await PyCodeInterpreterTool.create(MCP_URL, MCP_TOOL_NAME, SKILLS_DIR),
  ];

  const agent = new T12Agent(new OpenAI({ apiKey: OPENAI_API_KEY }), "gpt-4o", tools);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt: string) => new Promise<string>((resolve) => rl.question(prompt, resolve));

  while (true) {
    const userInput = (await ask("➡️: ")).trim();
    if (userInput === "exit") break;

    messages.push(new Message(Role.USER, userInput));
    const assistantMessage = await agent.chatCompletion(messages);
    messages.push(assistantMessage);
  }

  rl.close();
}

main().catch(console.error);
