import * as readline from "node:readline/promises";

import { OpenAI } from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

import { UserServiceClient } from "../user_service_client";

import { OPENAI_API_KEY, Role, UserInfo, UserSearchRequest } from "../../commons";

// TODO:
// Define QUERY_ANALYSIS_PROMPT - instructs the LLM to act as a query analysis system:
//   - Available search fields: name, surname, email
//   - Analyze the user question and extract explicit search values
//   - Map extracted values to the appropriate search fields
//   - Only extract values that are clearly stated - do not infer or assume
//   - Include examples: "Who is John?" → name: "John", "Find John Smith" → name: "John", surname: "Smith"
const QUERY_ANALYSIS_PROMPT = null;

// TODO:
// Define SYSTEM_PROMPT - instructs the LLM to act as a RAG-powered assistant:
//   - The user message contains two sections: RAG CONTEXT and USER QUESTION
//   - Answer ONLY based on the provided RAG CONTEXT and conversation history
//   - If no relevant information exists in RAG CONTEXT, state that the question cannot be answered
//   - Format user information clearly when presenting it
const SYSTEM_PROMPT = null;

// TODO:
// Define USER_PROMPT template with two placeholders:
//   - {context} - the retrieved user data formatted as text
//   - {query}   - the user's original question
const USER_PROMPT = null;


const SearchField = z.enum(["name", "surname", "email"]);
const SearchRequest = z.object({
  searchField: SearchField,
  searchValue: z.string()
});
const SearchRequests = z.object({
  searchRequestParams: z.array(SearchRequest)
});

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });
const userService = new UserServiceClient();


async function retrieveContext(userQuestion: string): Promise<Record<string, unknown>[]> {
  // TODO:
  // - Build a messages array with QUERY_ANALYSIS_PROMPT as system and userQuestion as user
  // - Call llmClient.beta.chat.completions.parse with:
  //   - model: 'gpt-4.1-nano', temperature: 0
  //   - response_format: zodResponseFormat(SearchRequests, 'searchRequests')
  // - Extract searchRequestParams from the parsed response
  // - If parameters exist:
  //   - Build a search object mapping each searchField → searchValue
  //   - Print "Searching with parameters: {object}"
  //   - Return userService.searchUsers(...) with the extracted fields
  // - If no parameters found, print "No specific search parameters found!" and return []
  throw new Error("Not implemented");
}

async function augmentPrompt(userQuestion: string, context: Record<string, unknown>[]): Promise<string> {
  // TODO:
  // - Format each user in context as a "User:\n  key: value\n" block (with blank line after each)
  // - Insert the formatted string into USER_PROMPT using the context and query placeholders
  // - Print the augmented prompt
  // - Return the augmented prompt string
  throw new Error("Not implemented");
}

async function generateAnswer(augmentedPrompt: string): Promise<string> {
  // TODO:
  // - Build a messages array with SYSTEM_PROMPT as system and augmentedPrompt as user
  // - Call llmClient.chat.completions.create with model: 'gpt-4.1-mini', temperature: 0
  // - Return the response content string (default to "" if null)
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
    const userQuestion = await rl.question(`➡️ `);

    if (userQuestion.toLowerCase() === "exit") {
      console.log("👋 Goodbye");
      rl.close();
      process.exit(0);
    }

    // TODO:
    // - Print "\n--- Retrieving context ---"
    // - Call retrieveContext(userQuestion) and store in context
    // - If context is not empty:
    //   - Print "\n--- Augmenting prompt ---"
    //   - Call augmentPrompt(userQuestion, context) and store in augmentedPrompt
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
