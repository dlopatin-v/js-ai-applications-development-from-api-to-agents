import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import Anthropic from "@anthropic-ai/sdk";

import { ANTHROPIC_API_KEY } from "../commons";

const SKILLS_VERSION = "skills-2025-10-02";

function filesFromDir(skillDir: string): File[] {
  // TODO:
  // The Anthropic SDK doesn't ship a filesFromDir helper for Node — roll your own.
  // - Recursively walk skillDir and collect every regular file
  // - Use path.dirname(skillDir) as the base for relative paths so the uploaded
  //   File names look like "<skill-folder>/SKILL.md" (skill folder name preserved)
  // - Infer a MIME type from the extension:
  //     .ts / .js  -> "text/plain"
  //     .md        -> "text/markdown"
  //     .json      -> "application/json"
  //     other      -> "application/octet-stream"
  // - Return an array of `new File([buffer], relativePath, { type: mimeType })`
  throw new Error("Not implemented");
}

async function getOrCreateSkill(skillTitle: string, skillDir: string, client: Anthropic): Promise<string> {
  // TODO:
  // - List all custom skills using the beta skills API (source="custom", betas=[SKILLS_VERSION])
  // - If a skill with a matching display_title already exists, print its info and return its ID
  // - Otherwise build the file list with filesFromDir(skillDir)
  // - Create a new skill with the title and files via client.beta.skills.create
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
  // - Keep a `messages: Anthropic.MessageParam[]` array and a containerId variable (initially undefined)
  // - Print a ready message and loop reading user input (exit on "exit")
  // - For each turn:
  //   - Build a container object with the skill reference (type "custom", skillId, version "latest")
  //   - If containerId is already set, include it on the container to reuse the running container
  //   - Build the full request payload (model "claude-sonnet-4-6", max_tokens, messages, container, betas, tools)
  //     Note: betas must include "code-execution-2025-08-25" and SKILLS_VERSION;
  //           tool type is "code_execution_20250825"
  //   - If logRequest is true, print the payload as indented JSON
  //   - Call client.beta.messages.create with the payload
  //   - If logResponse is true, print the full response as indented JSON;
  //     otherwise join all text blocks from response.content and print as "Claude: <text>"
  //   - If the response has a container, save its ID to containerId for reuse on next turns
  //   - Append the assistant message to messages (cast response.content as Anthropic.ContentBlockParam[])
  throw new Error("Not implemented");
}

const STYLE_SKILL_TITLE = "style-guide";
const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_TITLE);

const CALCULATOR_SKILL_TITLE = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_TITLE);

async function main(): Promise<void> {
  // TODO:
  // - Create an Anthropic client
  // - Call getOrCreateSkill with CALCULATOR_SKILL_TITLE / CALCULATOR_SKILL_DIR
  //   (swap to STYLE_SKILL_TITLE / STYLE_SKILL_DIR to test the style-guide skill instead)
  // - Call chat with the client and skillId
  // - (Optional) call deleteSkills after the chat session ends to clean up
  throw new Error("Not implemented");
}

main();
