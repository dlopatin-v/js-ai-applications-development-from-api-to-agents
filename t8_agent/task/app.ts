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
  // 1. Create list with all tools: WebSearchTool, GetUserByIdTool, SearchUsersTool,
  //    CreateUserTool, UpdateUserTool, DeleteUserTool
  // 2. Create OpenAIBasedAgent (or AnthropicBasedAgent) with all tools and SYSTEM_PROMPT
  // 3. Create Conversation
  // 4. Run infinite loop:
  //    - Get user input from terminal
  //    - Add User message to Conversation
  //    - Call agent with conversation history
  //    - Add Assistant message to Conversation and print its content
  throw new Error("Not implemented");
}

main();
