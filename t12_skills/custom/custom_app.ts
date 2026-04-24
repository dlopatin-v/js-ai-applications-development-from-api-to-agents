import * as readline from "readline";
import * as path from "path";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../../commons/constants.js";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { BaseTool } from "./tools/base.js";
import { SkillMetadata, loadSkills } from "./models.js";
import { ReadSkillTool } from "./tools/skills/read_skill_tool.js";
import { JsCodeInterpreterTool } from "./tools/jsInterpreter/jsCodeInterpreterTool.js";
import { T12Agent } from "./agent.js";

const SKILLS_DIR = path.join(__dirname, "_skills");
const MCP_TOOL_NAME = "execute_code";


function buildAvailableSkillsXml(skills: SkillMetadata[]): string {
  // TODO:
  // 1. Initialize `parts: string[] = ["<available_skills>"]`
  // 2. For each skill in skills:
  //       a. Push `  <skill name="${skill.name}">`
  //       b. Push `    <description>${skill.description}</description>`
  //       c. If skill.license, push `    <license>${skill.license}</license>`
  //       d. If skill.compatibility, push `    <compatibility>${skill.compatibility}</compatibility>`
  //       e. If skill.metadata, push `    <metadata>`, then for each [k, v] push `      <${k}>${v}</${k}>`, then push `    </metadata>`
  //       f. If skill.allowedTools, push `    <allowed-tools>${skill.allowedTools.join(" ")}</allowed-tools>`
  //       g. Push `  </skill>`
  // 3. Push `"</available_skills>"`
  // 4. Return parts.join("\n")
  throw new Error("Not implemented");
}

function buildSystemPrompt(skills: SkillMetadata[]): string {
  // TODO:
  // 1. Call buildAvailableSkillsXml(skills), assign to `skillsXml`
  // 2. Return a template-literal system prompt that:
  //    - Declares "You are an AI assistant with access to agent skills."
  //    - Embeds the skillsXml block
  //    - Explains "How to use skills" workflow:
  //      * Call `read_skill` with the skill's SKILL.md path (e.g. path="/<skill-name>/SKILL.md")
  //      * Follow the instructions in the loaded SKILL.md precisely
  //      * If instructions reference additional files, read them using `read_skill`
  //      * If the skill requires running a script, execute it with `${MCP_TOOL_NAME}`
  //    - Ends with "Always read the relevant SKILL.md before performing the task."
  throw new Error("Not implemented");
}


async function main(): Promise<void> {
  // TODO:
  // 1. Call loadSkills(SKILLS_DIR), assign to `skills`
  // 2. If skills.length === 0, print error and return
  // 3. Print loaded skill names
  // 4. Call buildSystemPrompt(skills), assign to `systemPrompt`; print it
  // 5. Initialize `messages: Message[] = [new Message(Role.SYSTEM, systemPrompt)]`
  // 6. Build tools list:
  //       - new ReadSkillTool(SKILLS_DIR)
  //       - await JsCodeInterpreterTool.create(SKILLS_DIR)
  // 7. Create `agent = new T12Agent(new OpenAI({ apiKey: OPENAI_API_KEY }), "gpt-4o", tools)`
  // 8. Start a readline loop:
  //       - Read user input; break on "exit"
  //       - Push new Message(Role.USER, input) to messages
  //       - Call await agent.chatCompletion(messages), assign to assistantMessage
  //       - Push assistantMessage to messages
  throw new Error("Not implemented");
}

main().catch(console.error);
