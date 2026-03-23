import * as readline from "readline";
import * as path from "path";
import { OPENAI_API_KEY, Message, Role } from "../../commons";
import { AgentMCPFundamentals } from "./agent.js";
import { StdioMCPClient } from "./mcp_clients/stdio.js";
import { HttpMCPClient } from "./mcp_clients/http.js";
import { SYSTEM_PROMPT } from "./prompts.js";
import { MCPClient, ToolSchema } from "./mcp_clients/base.js";

// https://remote.mcpservers.org/fetch/mcp
// Pay attention that `fetch` doesn't have resources and prompts

async function main() {
  // TODO: Create an mcpClient and connect to an MCP server.
  // Choose ONE of the options below (uncomment and configure):

  // 1. Local STDIO — spawns stdioServer.ts using the same npm run ts command
  // const mcpClient: MCPClient = new StdioMCPClient({
  //   command: "npm",
  //   args: ["run", "ts", path.join(__dirname, "..", "mcp_server", "stdioServer.ts")],
  //   env: { ...process.env } as Record<string, string>,
  // });

  // 2. Docker STDIO — runs a containerised MCP server
  // const mcpClient: MCPClient = new StdioMCPClient({ dockerImage: "mcp/duckduckgo:latest" });

  // 3. HTTP — requires httpServer.ts to be running on port 8005
  // const mcpClient: MCPClient = new HttpMCPClient("http://localhost:8005/mcp");

  const mcpClient: MCPClient = new StdioMCPClient({ dockerImage: "mcp/duckduckgo:latest" });

  await mcpClient.connect();

  try {
    console.log("\n=== Available Resources ===");
    const resources = await mcpClient.getResources();
    for (const resource of resources) {
      console.log(resource);
    }

    console.log("\n=== Available Tools ===");
    const tools: ToolSchema[] = await mcpClient.getTools();
    for (const tool of tools) {
      console.log(JSON.stringify(tool, null, 2));
    }

    const agent = new AgentMCPFundamentals({
      apiKey: OPENAI_API_KEY,
      model: "gpt-4o",
      tools,
      mcpClient,
    });

    const messages: Message[] = [
      new Message(Role.SYSTEM, SYSTEM_PROMPT),
    ];

    console.log("\n=== Available Prompts ===");
    const prompts = await mcpClient.getPrompts();
    for (const prompt of prompts) {
      console.log(prompt);
      const content = await mcpClient.getPrompt(prompt.name);
      console.log(content);
      messages.push(
        new Message(
          Role.USER,
          `## Prompt provided by MCP server:\n${prompt.description ?? ""}\n${content}`
        )
      );
    }

    console.log("MCP-based Agent is ready! Type your query or 'exit' to exit.");

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = () =>
      rl.question("\n> ", async (userInput) => {
        const trimmed = userInput.trim();
        if (trimmed.toLowerCase() === "exit") {
          rl.close();
          return;
        }
        messages.push(new Message(Role.USER, trimmed));
        const aiMessage = await agent.getCompletion(messages);
        messages.push(aiMessage);
        ask();
      });

    ask();
  } catch (err) {
    await mcpClient.disconnect();
    throw err;
  }
}

main().catch(console.error);
