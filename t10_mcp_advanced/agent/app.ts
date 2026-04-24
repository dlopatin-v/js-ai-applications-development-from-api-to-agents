import * as readline from "readline";
import { Message } from "../../commons/models/message.js";
import { Role } from "../../commons/models/role.js";
import { OPENAI_API_KEY } from "../../commons/constants.js";
import { MCPClient, ToolSchema } from "./clients/mcp_client.js";
import { CustomMCPClient } from "./clients/custom_mcp_client.js";
import { CustomAgentMCP } from "./agent.js";

async function main(): Promise<void> {
  // TODO:
  // 1. Create an empty tools array and an empty toolNameClientMap (tool name → client)
  // 2. Create UMS MCPClient for "http://localhost:8006/mcp" (use static create(), it's async)
  //    and collect its tools into tools + toolNameClientMap
  // 3. Create CustomMCPClient for "https://remote.mcpservers.org/fetch/mcp" (same pattern)
  //    and collect its tools into tools + toolNameClientMap
  // 4. Create CustomAgentMCP with apiKey, model, tools, toolNameClientMap
  // 5. Create messages array with a system Message instructing the LLM to help the user
  // 6. Run a simple console chat loop (same pattern as previous tasks)
  throw new Error("Not implemented");
}

main();

// Check if Arkadiy Dobkin present as a user, if not then search info about him in the web and add him
