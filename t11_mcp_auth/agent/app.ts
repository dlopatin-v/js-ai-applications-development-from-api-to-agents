import * as readline from "readline";
import { OPENAI_API_KEY, DEFAULT_SYSTEM_PROMPT } from "../../commons/constants.js";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { AgentMCPAuth } from "./_agent.js";
import { ApiKeyMCPClient } from "./mcp_clients/api_key_mcp_client.js";
import { OauthMCPClient } from "./mcp_clients/oauth_mcp_client.js";

const MCP_API_KEY = "dev-secret-key";

async function main(): Promise<void> {
  //TODO:
  // 1. Create an mcpClient and connect — choose ONE option (uncomment and use it):
  //       - new ApiKeyMCPClient("http://localhost:8007/mcp", MCP_API_KEY)
  //       - new OauthMCPClient("http://localhost:8008/mcp")
  //    Call await mcpClient.connect()
  // 2. Print "\n=== Available Tools ===" and fetch tools via mcpClient.getTools(),
  //    assign to `tools`; iterate and print each with JSON.stringify(tool, null, 2)
  // 3. Create an AgentMCPAuth instance with:
  //       apiKey: OPENAI_API_KEY, model: "gpt-4o", tools, mcpClient
  //    assign to `agent`
  // 4. Create initial `messages` array with a single new Message(Role.SYSTEM, DEFAULT_SYSTEM_PROMPT)
  // 5. Print "MCP-based Agent is ready! Type your query or 'exit' to exit."
  //    Run a readline loop: read user input, break on "exit",
  //    push new Message(Role.USER, userInput) to messages,
  //    call await agent.getCompletion(messages), push result to messages
  throw new Error("Not implemented");
}

main().catch(console.error);
