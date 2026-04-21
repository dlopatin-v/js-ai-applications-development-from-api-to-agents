import * as readline from "readline";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { OPENAI_API_KEY } from "../../commons/constants.js";
import { MCPClient, ToolSchema } from "./clients/mcp_client.js";
import { CustomMCPClient } from "./clients/custom_mcp_client.js";
import { CustomAgentMCP } from "./agent.js";

async function collectTools(
  client: MCPClient | CustomMCPClient,
  tools: ToolSchema[],
  toolNameClientMap: Map<string, MCPClient | CustomMCPClient>
): Promise<void> {
  const clientTools = await client.getTools();
  for (const tool of clientTools) {
    tools.push(tool);
    toolNameClientMap.set(tool.function.name, client);
    console.log(JSON.stringify(tool, null, 2));
  }
}

async function main(): Promise<void> {
  const tools: ToolSchema[] = [];
  const toolNameClientMap = new Map<string, MCPClient | CustomMCPClient>();

  const umsMcpClient = await MCPClient.create("http://localhost:8006/mcp");
  await collectTools(umsMcpClient, tools, toolNameClientMap);

  const fetchMcpClient = await CustomMCPClient.create("https://remote.mcpservers.org/fetch/mcp");
  await collectTools(fetchMcpClient, tools, toolNameClientMap);

  const agent = new CustomAgentMCP({
    apiKey: OPENAI_API_KEY,
    model: "gpt-4.1",
    tools,
    toolNameClientMap,
  });

  const messages: Message[] = [
    new Message(
      Role.SYSTEM,
      "You are an advanced AI agent. Your goal is to assist user with his questions."
    ),
  ];

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("MCP-based Agent is ready! Type your query or 'exit' to exit.");

  const ask = (): void => {
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
  };

  ask();
}

main();

// Check if Arkadiy Dobkin present as a user, if not then search info about him in the web and add him
