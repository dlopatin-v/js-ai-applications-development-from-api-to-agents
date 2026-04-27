import * as path from "path";
import * as readline from "readline";

import { AgentMCPFundamentals } from "./agent";
import { MCPClient, ToolSchema } from "./mcp_clients/base";
import { HttpMCPClient } from "./mcp_clients/http";
import { StdioMCPClient } from "./mcp_clients/stdio";
import { SYSTEM_PROMPT } from "./prompts";

import { OPENAI_API_KEY, Message, Role } from "../../commons";

// https://remote.mcpservers.org/fetch/mcp
// Pay attention that `fetch` doesn't have resources and prompts

async function main() {
  //TODO:
  // 1. Create an mcpClient — choose ONE of the three options below and uncomment it:
  //
  //    Option A — Local STDIO: spawns your own stdioServer.ts as a child process.
  //      const mcpClient: MCPClient = new StdioMCPClient({
  //        command: "npm",
  //        args: ["run", "ts", path.join(__dirname, "..", "mcp_server", "stdioServer.ts")],
  //        env: { ...process.env } as Record<string, string>,
  //      });
  //
  //    Option B — Docker STDIO: runs a containerised MCP server (only exposes tools).
  //      docker pull mcp/duckduckgo:latest
  //      const mcpClient: MCPClient = new StdioMCPClient({ dockerImage: "mcp/duckduckgo:latest" });
  //
  //    Option C — HTTP: connects to a running HTTP MCP server.
  //      Start the server first: npm run t9:mcp-server-http
  //      const mcpClient: MCPClient = new HttpMCPClient("http://localhost:8005/mcp");
  //
  // 2. Call await mcpClient.connect()
  // 3. Print "\n=== Available Resources ===" and fetch resources via mcpClient.getResources(),
  //    iterate and print each resource
  // 4. Print "\n=== Available Tools ===" and fetch tools via mcpClient.getTools(),
  //    iterate and print each tool with JSON.stringify(tool, null, 2)
  // 5. Create AgentMCPFundamentals with apiKey, model="gpt-4o", tools, mcpClient; assign to agent
  // 6. Create messages array with a single new Message(Role.SYSTEM, SYSTEM_PROMPT)
  // 7. Print "\n=== Available Prompts ===" and fetch prompts via mcpClient.getPrompts().
  //    For each prompt:
  //      - print the prompt
  //      - get its content with mcpClient.getPrompt(prompt.name) and print it
  //      - push new Message(Role.USER, `## Prompt provided by MCP server:\n${prompt.description}\n${content}`)
  //        to messages
  // 8. Print "MCP-based Agent is ready! Type your query or 'exit' to exit."
  // 9. Run a readline chat loop:
  //      - read user input; exit on "exit"
  //      - push new Message(Role.USER, trimmed) to messages
  //      - call await agent.getCompletion(messages), push result to messages
  throw new Error("Not implemented");
}

main().catch(console.error);
