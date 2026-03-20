import * as readline from "readline";
import { ANTHROPIC_API_KEY, OPENAI_API_KEY } from "../../commons/constants";
import { Conversation } from "../../commons/models/conversation";
import { Message } from "../../commons/models/message";
import { Role } from "../../commons/models/role";
import userClient from "../../commons/user_service/client";
import { AnthropicBasedAgent } from "./agents/anthropic";
import { OpenAIBasedAgent } from "./agents/openai";
import { SYSTEM_PROMPT } from "./prompts";
import { CreateUserTool } from "./tools/users/create_user_tool";
import { DeleteUserTool } from "./tools/users/delete_user_tool";
import { GetUserByIdTool } from "./tools/users/get_user_by_id_tool";
import { SearchUsersTool } from "./tools/users/search_users_tool";
import { UpdateUserTool } from "./tools/users/update_user_tool";
import { WebSearchTool } from "./tools/web_search";

async function main() {
  const tools = [
    new WebSearchTool(OPENAI_API_KEY),
    new GetUserByIdTool(userClient),
    new SearchUsersTool(userClient),
    new CreateUserTool(userClient),
    new UpdateUserTool(userClient),
    new DeleteUserTool(userClient),
  ];

  // const agent = new OpenAIBasedAgent({
  //   model: "gpt-5.2",
  //   apiKey: OPENAI_API_KEY,
  //   tools,
  //   systemPrompt: SYSTEM_PROMPT,
  // });
  const agent = new AnthropicBasedAgent(
    "claude-sonnet-4-5",
    ANTHROPIC_API_KEY,
    tools,
    SYSTEM_PROMPT,
  );

  const conversation = new Conversation();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Type your question or 'exit' to quit.");
  console.log("Sample:");
  console.log("Add Andrej Karpathy as a new user");

  const ask = () => {
    rl.question("> ", async (userInput) => {
      const trimmed = userInput.trim();

      if (trimmed.toLowerCase() === "exit") {
        console.log("Exiting the chat. Goodbye!");
        rl.close();
        return;
      }

      conversation.addMessage(new Message(Role.USER, trimmed));

      const aiMessage = await agent.getResponse(conversation.messages, true);
      conversation.addMessage(aiMessage);
      console.log("AI:", aiMessage.content);
      console.log("=".repeat(100));
      console.log();

      ask();
    });
  };

  ask();
}

main();
