import * as path from "path";
import * as readline from "readline";

import { OpenAI } from "openai";

import { AgentMCPFundamentals } from "./agent";
import { MCPClient, ToolSchema } from "./mcp_clients/base";
import { HttpMCPClient } from "./mcp_clients/http";
import { StdioMCPClient } from "./mcp_clients/stdio";
import { SYSTEM_PROMPT } from "./prompts";

import { OPENAI_API_KEY, Message, Role } from "../../commons";

// https://remote.mcpservers.org/fetch/mcp
// Pay attention that `fetch` doesn't have resources and prompts

async function main() {
  // TODO:
  // 1. Create an mcpClient and connect to an MCP server.
  //    Choose ONE of the options below (uncomment and configure):
  //
  //    a. Local STDIO — spawns stdioServer.ts via npm run ts
  //    // const mcpClient: MCPClient = new StdioMCPClient({
  //    //   command: "npm",
  //    //   args: ["run", "ts", path.join(__dirname, "..", "mcp_server", "stdioServer.ts")],
  //    //   env: { ...process.env } as Record<string, string>,
  //    // });
  //
  //    b. Docker STDIO — runs a containerised MCP server
  //    // const mcpClient: MCPClient = new StdioMCPClient({ dockerImage: "mcp/duckduckgo:latest" });
  //
  //    c. HTTP — requires httpServer.ts to be running on port 8005
  //    // const mcpClient: MCPClient = new HttpMCPClient("http://localhost:8005/mcp");
  //
  // 2. Print Available Resources
  // 3. Print Available Tools
  // 4. Create AgentMCPFundamentals
  // 5. Create messages list with a single system prompt message
  // 6. Print Available Prompts and append each prompt content as a USER message
  // 7. Run an infinite loop:
  //    - get user input
  //    - if "exit": break
  //    - append Message(Role.USER, userInput) to messages
  //    - call agent.getCompletion(messages) and append the returned ai_message
  throw new Error("Not implemented");
}

main().catch(console.error);
