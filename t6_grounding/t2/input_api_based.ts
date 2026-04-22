import { OpenAI } from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { OPENAI_API_KEY, Role, UserSearchRequest } from "../../commons";
import { UserServiceClient } from "../user_service_client";
import { z } from "zod";
import * as readline from "node:readline/promises";

const QUERY_ANALYSIS_PROMPT = `You are a query analysis system that extracts search parameters from user questions about users.

## Available Search Fields:
- **name**: User's first name (e.g., "John", "Mary")
- **surname**: User's last name (e.g., "Smith", "Johnson") 
- **email**: User's email address (e.g., "john@example.com")

## Instructions:
1. Analyze the user's question and identify what they're looking for
2. Extract specific search values mentioned in the query
3. Map them to the appropriate search fields
4. If multiple search criteria are mentioned, include all of them
5. Only extract explicit values - don't infer or assume values not mentioned

## Examples:
- "Who is John?" → name: "John"
- "Find users with surname Smith" → surname: "Smith" 
- "Look for john@example.com" → email: "john@example.com"
- "Find John Smith" → name: "John", surname: "Smith"
- "I need user emails that filled with hiking" → No clear search parameters (return empty list)`;

const SYSTEM_PROMPT = `You are a RAG-powered assistant that assists users with their questions about user information.
            
## Structure of User message:
\`RAG CONTEXT\` - Retrieved documents relevant to the query.
\`USER QUESTION\` - The user's actual question.

## Instructions:
- Use information from \`RAG CONTEXT\` as context when answering the \`USER QUESTION\`.
- Cite specific sources when using information from the context.
- Answer ONLY based on conversation history and RAG context.
- If no relevant information exists in \`RAG CONTEXT\` or conversation history, state that you cannot answer the question.
- Be conversational and helpful in your responses.
- When presenting user information, format it clearly and include relevant details.`;

const getUserPrompt = (context: string, query: string) => (`## RAG CONTEXT:
${context}

## USER QUESTION:
${query}`);

const SearchField = z.enum(["name", "surname", "email"]);
const SearchRequest = z.object({
  searchField: SearchField,
  searchVale: z.string()
})
const SearchRequests = z.object({
  searchRequestParams: z.array(SearchRequest)
});

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });
const userService = new UserServiceClient();


async function retrieveContext(userRequest: string): Promise<any> {
  // TODO: Use llmClient.chat.completions.parse() with zodResponseFormat(SearchRequests, 'searchRequests')
  // and QUERY_ANALYSIS_PROMPT to extract search parameters from userRequest.
  // Then call userService.searchUsers() with the combined search fields.
  // Return the list of matching users, or [] if no params were extracted.
  throw new Error("Not implemented");
}

async function augmentPrompt(userRequest: string, context: Array<any>): Promise<any> {
  // TODO: Format each user in context as:
  //   "User:\n  key: value\n  ..."
  // Build the augmented prompt with getUserPrompt() and log it.
  // Return the augmented prompt string.
  throw new Error("Not implemented");
}

async function generateAnswer(augmentedPrompt: string): Promise<any> {
  // TODO: Call llmClient.chat.completions.create() with SYSTEM_PROMPT and augmentedPrompt.
  // Model: gpt-4.1-mini, temperature 0.
  // Return the response content string.
  throw new Error("Not implemented");
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  console.log("Query samples:");
  console.log(" - I need user emails that filled with hiking and psychology");
  console.log(" - Who is John?");
  console.log(" - Find users with surname Adams");
  console.log(" - Do we have smbd with name John that love painting?");

  while (true) {
    const userRequest = await rl.question(`➡️ `);

    if (userRequest === "exit") {
      console.log("👋 Goodbye");
      rl.close();
      process.exit(0);
    }

    // TODO:
    // - Print "\n--- Retrieving context ---"
    // - Call retrieveContext(userRequest) and store in context
    // - If context is not empty:
    //   - Print "\n--- Augmenting prompt ---"
    //   - Call augmentPrompt(userRequest, context) and store in augmentedPrompt
    //   - Print "\n--- Generating answer ---"
    //   - Call generateAnswer(augmentedPrompt), print "\nAnswer: ${answer}\n"
    // - Otherwise: print "\n--- No relevant information found ---"
    throw new Error("Not implemented");
  }
}

main();

// The problems with API based Grounding approach are:
//   - We need a Pre-Step to figure out what field should be used for search (Takes time)
//   - Values for search should be correct (✅ John -> ❌ Jonh)
//   - Is not so flexible
// Benefits are:
//   - We fetch actual data (new users added and deleted every 5 minutes)
//   - Costs reduce
