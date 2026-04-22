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
  const lines: string[] = ["<available_skills>"];

  for (const skill of skills) {
    lines.push(`  <skill name="${skill.name}">`);
    lines.push(`    <description>${skill.description}</description>`);
    if (skill.license) lines.push(`    <license>${skill.license}</license>`);
    if (skill.compatibility) lines.push(`    <compatibility>${skill.compatibility}</compatibility>`);
    if (skill.metadata) {
      lines.push("    <metadata>");
      for (const [k, v] of Object.entries(skill.metadata)) {
        lines.push(`      <${k}>${v}</${k}>`);
      }
      lines.push("    </metadata>");
    }
    if (skill.allowedTools?.length) {
      lines.push(`    <allowed-tools>${skill.allowedTools.join(" ")}</allowed-tools>`);
    }
    lines.push("  </skill>");
  }

  lines.push("</available_skills>");
  return lines.join("\n");
}

export function buildSystemPrompt(skills: SkillMetadata[]): string {
  return `\
You are an AI assistant with access to agent skills.

${buildAvailableSkillsXml(skills)}

## How to use skills

When the user's request matches a skill, activate it:
1. Call \`read_skill\` with the skill's SKILL.md path (e.g. path="/<skill-name>/SKILL.md") to load \
its full instructions.
2. Follow the instructions in the loaded SKILL.md precisely.

Always read the relevant SKILL.md before performing the task.`;
}

// --------------------------------------------------------------------------
// Application bootstrap
// --------------------------------------------------------------------------

async function main(): Promise<void> {
  // 1. Load skills and build system prompt
  const skills = loadSkills(SKILLS_DIR);
  console.log(`Loaded ${skills.length} skill(s): ${skills.map((s) => s.name).join(", ")}`);
  const systemPrompt = buildSystemPrompt(skills);

  // 2. Assemble tools
  const tools: BaseTool[] = [new ReadSkillTool(SKILLS_DIR)];

  // 3. Connect to UMS MCP server (HTTP)
  const umsMcpUrl = process.env.UMS_MCP_URL ?? "http://localhost:8005/mcp";
  console.log(`Connecting to UMS MCP server at ${umsMcpUrl}…`);
  const umsMcpClient = await HttpMcpClient.create(umsMcpUrl);
  for (const toolModel of await umsMcpClient.getTools()) {
    tools.push(new McpTool(umsMcpClient, toolModel));
    console.log(`  Registered UMS tool: ${toolModel.name}`);
  }

  // 4. Connect to DuckDuckGo MCP server (stdio / Docker)
  console.log("Connecting to DuckDuckGo MCP server (Docker)…");
  const ddgMcpClient = await StdioMcpClient.create("khshanovskyi/ddg-mcp-server:latest");
  for (const toolModel of await ddgMcpClient.getTools()) {
    tools.push(new McpTool(ddgMcpClient, toolModel));
    console.log(`  Registered DuckDuckGo tool: ${toolModel.name}`);
  }

  // 5. Create agent
  const agent = new UMSAgent(
    process.env.OPENAI_API_KEY ?? "",
    "gpt-4o",
    tools,
  );

  // 6. Connect to Redis
  const redisHost = process.env.REDIS_HOST ?? "localhost";
  const redisPort = parseInt(process.env.REDIS_PORT ?? "6379", 10);
  console.log(`Connecting to Redis at ${redisHost}:${redisPort}…`);
  const redisClient = createClient({ socket: { host: redisHost, port: redisPort } });
  await redisClient.connect();
  await redisClient.ping();
  console.log("Redis connection established");

  // 7. Create ConversationManager
  const conversationManager = new ConversationManager(agent, redisClient, systemPrompt);

  // 8. Build Express server
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --------------------------------------------------------------------------
  // Endpoints
  // --------------------------------------------------------------------------

  app.get("/health", (_req, res) => {
    res.json({
      status: "healthy",
      conversation_manager_initialized: conversationManager !== undefined
    });
  });

  app.post("/conversations", async (req, res) => {
    const conversation = await conversationManager.createConversation(req.body?.title);
    res.json(conversation);
  });

  app.get("/conversations", async (_req, res) => {
    const conversations = await conversationManager.listConversations();
    res.json(conversations);
  });

  app.get("/conversations/:id", async (req, res) => {
    const conversation = await conversationManager.getConversation(req.params.id);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(conversation);
  });

  app.delete("/conversations/:id", async (req, res) => {
    const deleted = await conversationManager.deleteConversation(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ message: "Conversation deleted successfully" });
  });

  app.post("/conversations/:id/chat", async (req, res) => {
    const { message: msgBody, stream = false } = req.body;
    const userMessage = new Message(
      msgBody.role,
      msgBody.content,
      msgBody.tool_call_id,
      msgBody.name,
      msgBody.tool_calls,
    );

    const result = await conversationManager.chat(userMessage, req.params.id, stream);

    if (stream) {
      const generator = result as AsyncGenerator<string>;
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      for await (const chunk of generator) {
        res.write(chunk);
      }
      res.end();
      return;
    }

    res.json(result as { content: string; conversation_id: string });
  });

  // 9. Start server
  const PORT = 8011;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UMS Agent server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
