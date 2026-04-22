import * as path from "path";
import express from "express";
import cors = require("cors");
import { createClient } from "redis";
import { Message } from "commons/models/message";
import { SkillMetadata, loadSkills } from "./models.js";
import { BaseTool } from "./tools/base.js";
import { McpTool } from "./tools/mcp_tool.js";
import { ReadSkillTool } from "./tools/read_skill_tool.js";
import { HttpMcpClient } from "./clients/http_mcp_client.js";
import { StdioMcpClient } from "./clients/stdio_mcp_client.js";
import { UMSAgent } from "./ums_agent.js";
import { ConversationManager } from "./conversation_manager.js";

const SKILLS_DIR = path.resolve(__dirname, "../_skills");

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function buildAvailableSkillsXml(skills: SkillMetadata[]): string {
  // TODO:
  // Build and return an XML string with root element <available_skills>.
  // For each skill add a <skill name="..."> element with child elements:
  //   - <description> (always)
  //   - <license> (if present)
  //   - <compatibility> (if present)
  //   - <metadata> with a dynamic child element per key/value pair (if present)
  //   - <allowed-tools> as a space-joined string (if present)
  throw new Error("Not implemented");
}

export function buildSystemPrompt(skills: SkillMetadata[]): string {
  // TODO:
  // Build and return the system prompt string that:
  //   - Describes the assistant as an AI with access to agent skills
  //   - Embeds the XML from buildAvailableSkillsXml(skills)
  //   - Explains how to use skills:
  //       1. Call `read_skill` with path="/<skill-name>/SKILL.md" to load instructions
  //       2. Follow the loaded SKILL.md precisely
  throw new Error("Not implemented");
}

// --------------------------------------------------------------------------
// Application bootstrap
// --------------------------------------------------------------------------

async function main(): Promise<void> {
  // TODO:
  // Startup:
  // 1. Load skills from SKILLS_DIR with loadSkills(), build systemPrompt with buildSystemPrompt()
  // 2. Create tools list starting with new ReadSkillTool(SKILLS_DIR)
  // 3. Init HttpMcpClient via HttpMcpClient.create() using UMS_MCP_URL env var
  //    (default http://localhost:8005/mcp), get its tools and append each as McpTool
  // 4. Init StdioMcpClient with docker image "khshanovskyi/ddg-mcp-server:latest",
  //    get its tools and append each as McpTool
  // 5. Create UMSAgent with OPENAI_API_KEY env var, model "gpt-4o", and tools
  // 6. Create redis client from REDIS_HOST / REDIS_PORT env vars (defaults localhost:6379),
  //    connect and ping it
  // 7. Create ConversationManager(agent, redisClient, systemPrompt)
  // 8. Build Express app with cors() and express.json() middleware
  throw new Error("Not implemented");

  // --------------------------------------------------------------------------
  // Endpoints
  // --------------------------------------------------------------------------

  // TODO:
  // Create the following endpoints:
  // 1. GET  /health — health check, returns status and conversation_manager_initialized
  // 2. POST /conversations — create conversation (body: { title? })
  // 3. GET  /conversations — list all conversations
  // 4. GET  /conversations/:id — get one conversation (404 if not found)
  // 5. DELETE /conversations/:id — delete conversation (404 if not found)
  // 6. POST /conversations/:id/chat — chat endpoint (body: { message, stream? })
  //    If stream: set SSE headers and stream generator chunks; else return JSON result
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
