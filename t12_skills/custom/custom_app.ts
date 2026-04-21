import * as readline from "readline";
import * as path from "path";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../../commons/constants.js";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { BaseTool } from "./tools/base.js";
import { SkillMetadata, loadSkills } from "./models.js";
import { ReadSkillTool } from "./tools/skills/read_skill_tool.js";
import { PythonCodeInterpreterTool } from "./tools/pyInterpreter/pythonCodeInterpreterTool.js";
import { T12Agent } from "./agent.js";

const SKILLS_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "_skills");
const MCP_URL = "http://localhost:8050/mcp";
const MCP_TOOL_NAME = "execute_code";

/**
 * Builds an XML snippet listing all available skill names and descriptions.
 * @param skills - Array of SkillMetadata objects loaded from the skills directory.
 * @returns An XML string with a <skills> root element and one <skill> per entry.
 * Hint: map each skill to <skill name="..." description="..."/>.
 */
function buildAvailableSkillsXml(skills: SkillMetadata[]): string {
  // TODO
}

/**
 * Builds the system prompt that tells the agent how to use the available skills.
 * @param skills - Array of SkillMetadata objects to embed in the prompt.
 * @returns A multi-line system prompt string containing the XML skills list.
 * Hint: embed the result of buildAvailableSkillsXml; instruct the agent to call
 * read_skill before executing code for a skill.
 */
function buildSystemPrompt(skills: SkillMetadata[]): string {
  // TODO
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
