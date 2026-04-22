import * as readline from "readline";
import { ANTHROPIC_API_KEY, OPENAI_API_KEY, Conversation, Message, Role } from "../../commons";
import userClient from "../../commons/user_service/client";
import { AnthropicBasedAgent } from "./agents/anthropic";
import { SYSTEM_PROMPT } from "./prompts";
import { CreateUserTool } from "./tools/users/create_user_tool";
import { DeleteUserTool } from "./tools/users/delete_user_tool";
import { GetUserByIdTool } from "./tools/users/get_user_by_id_tool";
import { SearchUsersTool } from "./tools/users/search_users_tool";
import { UpdateUserTool } from "./tools/users/update_user_tool";
import { WebSearchTool } from "./tools/web_search";

async function main() {
  // TODO:
  // 1. Create tools list:
  //    - new WebSearchTool(OPENAI_API_KEY)
  //    - new GetUserByIdTool(userClient)
  //    - new SearchUsersTool(userClient)
  //    - new CreateUserTool(userClient)
  //    - new UpdateUserTool(userClient)
  //    - new DeleteUserTool(userClient)
  // 2. Create agent — choose one:
  //    - new OpenAIBasedAgent({ model: "gpt-5.2", apiKey: OPENAI_API_KEY, tools, systemPrompt: SYSTEM_PROMPT })
  //    - new AnthropicBasedAgent("claude-sonnet-4-5", ANTHROPIC_API_KEY, tools, SYSTEM_PROMPT)
  // 3. Create new Conversation()
  // 4. Print "Type your question or 'exit' to quit." and sample prompt
  // 5. Run infinite loop:
  //    5.1. Get user input from terminal (input("> ").trim())
  //    5.2. If "exit": print goodbye and break
  //    5.3. Add new Message(Role.USER, trimmed) to conversation
  //    5.4. Call agent.getResponse(conversation.messages, true) → aiMessage
  //    5.5. Add aiMessage to conversation
  //    5.6. Print `AI: ${aiMessage.content}` and separator
  throw new Error("Not implemented");
}

main();
