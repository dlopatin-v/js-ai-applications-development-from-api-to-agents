import * as readline from "readline";

import { AgentMCPAuth } from "./_agent";
import { ApiKeyMCPClient } from "./mcp_clients/api_key_mcp_client";
import { OauthMCPClient } from "./mcp_clients/oauth_mcp_client";

import { OPENAI_API_KEY, DEFAULT_SYSTEM_PROMPT, Message, Role } from "../../commons";

const MCP_API_KEY = "dev-secret-key";

async function main(): Promise<void> {
  // TODO:
  // 1. Create an MCP client — pick one (comment out the other):
  //    - ApiKeyMCPClient: new ApiKeyMCPClient("http://localhost:8007/mcp", MCP_API_KEY)
  //    - OauthMCPClient:  new OauthMCPClient("http://localhost:8008/mcp")
  // 2. Connect the client: await mcpClient.connect()
  // 3. List and log available tools: await mcpClient.getTools()
  //    Print each tool as JSON.stringify(tool, null, 2)
  // 4. Create an AgentMCPAuth with { apiKey: OPENAI_API_KEY, model: "gpt-4o", tools, mcpClient }
  // 5. Set up a messages array with a SYSTEM message using DEFAULT_SYSTEM_PROMPT
  // 6. Create a readline interface on stdin/stdout
  // 7. In a recursive askQuestion() loop:
  //    a. Prompt "> " for user input
  //    b. If input is "exit" — close readline, disconnect mcpClient, return
  //    c. Push a USER message, call agent.getCompletion(messages), push the response
  //    d. Call askQuestion() again to continue the loop
}

main().catch(console.error);
