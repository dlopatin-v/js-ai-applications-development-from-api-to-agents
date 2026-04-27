import * as readline from "readline";

import { AgentMCPAuth } from "./_agent";
import { ApiKeyMCPClient } from "./mcp_clients/api_key_mcp_client";
import { OauthMCPClient } from "./mcp_clients/oauth_mcp_client";

import { OPENAI_API_KEY, DEFAULT_SYSTEM_PROMPT, Message, Role } from "../../commons";

const MCP_API_KEY = "dev-secret-key";

async function main(): Promise<void> {
  // const mcpClient = new ApiKeyMCPClient("http://localhost:8007/mcp", MCP_API_KEY);
  const mcpClient = new OauthMCPClient("http://localhost:8008/mcp");
  await mcpClient.connect();

  console.log("\n=== Available Tools ===");
  const tools = await mcpClient.getTools();
  for (const tool of tools) {
    console.log(JSON.stringify(tool, null, 2));
  }

  const agent = new AgentMCPAuth({
    apiKey: OPENAI_API_KEY,
    model: "gpt-4o",
    tools,
    mcpClient,
  });

  const messages: Message[] = [
    new Message(Role.SYSTEM, DEFAULT_SYSTEM_PROMPT),
  ];

  console.log("MCP-based Agent is ready! Type your query or 'exit' to exit.");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const askQuestion = (): void => {
    rl.question("\n> ", async (userInput) => {
      userInput = userInput.trim();
      if (userInput.toLowerCase() === "exit") {
        rl.close();
        await mcpClient.disconnect();
        return;
      }

      messages.push(new Message(Role.USER, userInput));
      const aiMessage = await agent.getCompletion(messages);
      messages.push(aiMessage);

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
