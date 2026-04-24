import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import * as readline from "readline";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../commons/constants.js";

function zipSkill(skillDir: string): Buffer {
  // ZIP the skill directory so it can be uploaded.
  // Note: zip_skill() in Python is already implemented — replicate the same logic here:
  // - Recursively collect all files under skillDir
  // - Write each into a zip archive using the path relative to skillDir's parent
  // - Return the zip contents as a Buffer
  throw new Error("Not implemented");
}

async function getOrCreateSkill(skillName: string, skillDir: string, client: OpenAI): Promise<string> {
  // TODO:
  // - List existing skills and return the ID if one with a matching name already exists
  // - Otherwise zip the skill directory using zipSkill()
  // - Upload the zip as a new skill and return its ID
  throw new Error("Not implemented");
}

function chat(client: OpenAI, skillId: string, logRequest = true, logResponse = true): void {
  // TODO:
  // - Keep a previousResponseId variable (initially null)
  // - Print a ready message and loop reading user input (exit on "exit")
  // - For each turn:
  //   - Build an environment dict with type "container_auto" and the skill reference
  //     (type "skill_reference", skillId)
  //   - Build the request payload (model, input with user message, shell tool with the environment)
  //   - If previousResponseId is set, include it in the payload to chain conversation history
  //   - If logRequest is true, print the payload as indented JSON
  //   - Call client.responses.create with the payload and save the response
  //   - Update previousResponseId from the response
  //   - If logResponse is true, print the full response as indented JSON;
  //     otherwise print response.output_text
  throw new Error("Not implemented");
}

async function deleteSkills(client: OpenAI): Promise<void> {
  // TODO:
  // - List all uploaded skills
  // - Delete each one and print its name as confirmation
  throw new Error("Not implemented");
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// const STYLE_SKILL_NAME = "style-guide";
// const STYLE_SKILL_DIR = path.join(__dirname, "_skills", STYLE_SKILL_NAME);

const CALCULATOR_SKILL_NAME = "calculator";
const CALCULATOR_SKILL_DIR = path.join(__dirname, "_skills", CALCULATOR_SKILL_NAME);

async function main(): Promise<void> {
  // TODO:
  // - Create an OpenAI client
  // - Call getOrCreateSkill (choose CALCULATOR or STYLE skill dir/name to test)
  // - Call chat with the client and skillId
  // - Call deleteSkills to clean up after the session
  throw new Error("Not implemented");
}

main();
