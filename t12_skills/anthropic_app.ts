import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "../commons/constants.js";

const SKILLS_VERSION = "skills-2025-10-02";

async function getOrCreateSkill(skillTitle: string, skillDir: string, client: Anthropic): Promise<string> {
  // TODO:
  // - List all custom skills using the beta skills API (source="custom", betas=[SKILLS_VERSION])
  // - If a skill with a matching title already exists, print its info and return its ID
  // - Otherwise create a new skill with the title and files from skillDir
  //   (use anthropic.lib.filesFromDir or equivalent)
  // - Print the new skill ID and return it
  throw new Error("Not implemented");
}

async function deleteSkills(client: Anthropic): Promise<void> {
  // TODO:
  // - List all custom skills
  // - For each skill, list all its versions and delete each one (print confirmation per version)
  // - Then delete the skill itself (print confirmation)
  throw new Error("Not implemented");
}

function chat(client: Anthropic, skillId: string, logRequest = true, logResponse = true): void {
  // TODO:
  // Multi-turn chat loop that reuses the container across turns.
  // - Keep a messages array and a containerID variable (initially null)
  // - Print a ready message and loop reading user input (exit on "exit")
  // - For each turn:
  //   - Build a container dict with the skill reference (type "custom", skillId, version "latest")
  //   - If containerID is already set, include it to reuse the running container
  //   - Build the full request payload (model, max_tokens, messages, container, betas, tools)
  //     Note: betas must include "code-execution-2025-08-25" and SKILLS_VERSION;
  //           tool type is "code_execution_20250825"
  //   - If logRequest is true, print the payload as indented JSON
  //   - Call client.beta.messages.create with the payload
  //   - If logResponse is true, print the full response as indented JSON;
  //     otherwise join all text blocks from response.content and print as "Claude: <text>"
  //   - If the response has a container, save its ID to containerID for reuse on next turns
  //   - Append the assistant message to messages
  throw new Error("Not implemented");
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const STYLE_SKILL_TITLE = "style-guide";
const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_TITLE);

// const CALCULATOR_SKILL_TITLE = "calculator";
// const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_TITLE);

async function main(): Promise<void> {
  // TODO:
  // - Create an Anthropic client
  // - Call getOrCreateSkill (choose STYLE_SKILL or CALCULATOR_SKILL dir/title to test)
  // - Call chat with the client and skillId
  // - Call deleteSkills to clean up after the session
  throw new Error("Not implemented");
}

main();
