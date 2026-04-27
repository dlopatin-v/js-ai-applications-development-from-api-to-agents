import * as path from "path";

import cors = require("cors");
import express from "express";
import { createClient } from "redis";

import { HttpMcpClient } from "./clients/http_mcp_client";
import { StdioMcpClient } from "./clients/stdio_mcp_client";
import { ConversationManager } from "./conversation_manager";
import { SkillMetadata, loadSkills } from "./models";
import { BaseTool } from "./tools/base";
import { McpTool } from "./tools/mcp_tool";
import { ReadSkillTool } from "./tools/read_skill_tool";
import { UMSAgent } from "./ums_agent";

import { Message } from "../../../commons";

const SKILLS_DIR = path.resolve(__dirname, "../_skills");

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function buildAvailableSkillsXml(skills: SkillMetadata[]): string {
  // TODO:
  // 1. Start with `const lines: string[] = ["<available_skills>"]`
  // 2. For each skill, push `  <skill name="${skill.name}">`
  // 3. Always push `    <description>${skill.description}</description>`
  // 4. If `skill.license`: push `    <license>${skill.license}</license>`
  // 5. If `skill.compatibility`: push `    <compatibility>${skill.compatibility}</compatibility>`
  // 6. If `skill.metadata`: push `    <metadata>`, then for each `[k, v]` of `Object.entries(skill.metadata)`:
  //    push `      <${k}>${v}</${k}>`, then push `    </metadata>`
  // 7. If `skill.allowedTools?.length`: push `    <allowed-tools>${skill.allowedTools.join(" ")}</allowed-tools>`
  // 8. Push `  </skill>`
  // 9. After all skills, push `</available_skills>` and return `lines.join("\n")`
  throw new Error("Not implemented");
}

export function buildSystemPrompt(skills: SkillMetadata[]): string {
  // TODO:
  // Build and return the system prompt string using a template literal. It must contain:
  // 1. A role description line — state the assistant is an AI with access to agent skills
  // 2. The XML block produced by `buildAvailableSkillsXml(skills)` embedded inline
  // 3. A "## How to use skills" section explaining:
  //    - When the user's request matches a skill, call `read_skill` with path="/<skill-name>/SKILL.md"
  //      to load its full instructions, then follow them precisely
  //    - Always read the relevant SKILL.md before performing the task
  throw new Error("Not implemented");
}

// --------------------------------------------------------------------------
// Application bootstrap
// --------------------------------------------------------------------------

async function main(): Promise<void> {
  // TODO:
  // 1. Load skills: `const skills = loadSkills(SKILLS_DIR)` and log the count
  //    Build system prompt: `const systemPrompt = buildSystemPrompt(skills)`
  // 2. Create tools list: `const tools: BaseTool[] = [new ReadSkillTool(SKILLS_DIR)]`
  // 3. Connect to UMS MCP server:
  //    - Read `UMS_MCP_URL` from `process.env.UMS_MCP_URL` (default `"http://localhost:8005/mcp"`)
  //    - `const umsMcpClient = await HttpMcpClient.create(umsMcpUrl)`
  //    - For each toolModel in `await umsMcpClient.getTools()`: push `new McpTool(umsMcpClient, toolModel)`
  // 4. Connect to DuckDuckGo MCP server:
  //    - `const ddgMcpClient = await StdioMcpClient.create("khshanovskyi/ddg-mcp-server:latest")`
  //    - For each toolModel in `await ddgMcpClient.getTools()`: push `new McpTool(ddgMcpClient, toolModel)`
  // 5. Create agent: `new UMSAgent(process.env.OPENAI_API_KEY ?? "", <model>, tools)`
  //    (choose an appropriate model name)
  // 6. Create Redis client:
  //    - `redisHost = process.env.REDIS_HOST ?? "localhost"`
  //    - `redisPort = parseInt(process.env.REDIS_PORT ?? "6379", 10)`
  //    - `createClient({ socket: { host: redisHost, port: redisPort } })`
  //    - `await redisClient.connect()` and `await redisClient.ping()`
  // 7. Create `ConversationManager(agent, redisClient, systemPrompt)`
  // 8. Build Express app:
  //    - `app.use(cors())` and `app.use(express.json())`
  // 9. Register endpoints (see below)
  // 10. Start server: `app.listen(8011, "0.0.0.0", ...)`
  throw new Error("Not implemented");

  // --------------------------------------------------------------------------
  // Endpoints
  // --------------------------------------------------------------------------

  // TODO: GET /health
  // - Return JSON `{ status: "healthy", conversation_manager_initialized: conversationManager !== undefined }`

  // TODO: POST /conversations
  // - If `conversationManager` is not initialized: `res.status(503).json({ error: "Service not initialized" })` and return
  // - Call `await conversationManager.createConversation(req.body?.title)` and return JSON result

  // TODO: GET /conversations
  // - If `conversationManager` is not initialized: `res.status(503).json({ error: "Service not initialized" })` and return
  // - Call `await conversationManager.listConversations()` and return JSON result

  // TODO: GET /conversations/:id
  // - If `conversationManager` is not initialized: `res.status(503).json({ error: "Service not initialized" })` and return
  // - Call `await conversationManager.getConversation(req.params.id)`
  // - If null: `res.status(404).json({ error: "Conversation not found" })` and return
  // - Otherwise: `res.json(conversation)`

  // TODO: DELETE /conversations/:id
  // - If `conversationManager` is not initialized: `res.status(503).json({ error: "Service not initialized" })` and return
  // - Call `await conversationManager.deleteConversation(req.params.id)`
  // - If false: `res.status(404).json({ error: "Conversation not found" })` and return
  // - Otherwise: `res.json({ message: "Conversation deleted successfully" })`

  // TODO: POST /conversations/:id/chat
  // - If `conversationManager` is not initialized: `res.status(503).json({ error: "Service not initialized" })` and return
  // - Destructure `{ message: msgBody, stream = false }` from `req.body`
  // - Build `userMessage = new Message(msgBody.role, msgBody.content, msgBody.tool_call_id, msgBody.name, msgBody.tool_calls)`
  // - `const result = await conversationManager.chat(userMessage, req.params.id, stream)`
  // - If `stream`: set SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`),
  //   iterate `for await (const chunk of result as AsyncGenerator<string>)` and `res.write(chunk)`, then `res.end()`
  // - Otherwise: `res.json(result as { content: string; conversation_id: string })`
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
