import { OpenAI } from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

import { UserServiceClient } from "../user_service_client";

import { OPENAI_API_KEY } from "../../commons";

// TODO:
// Define QUERY_ANALYSIS_PROMPT for extracting search parameters from user questions:
// - Role: query analysis system
// - Available Search Fields section listing: name, surname, email (with examples of values)
// - Instructions:
//   1. Analyze the user's question and identify what they're looking for
//   2. Extract specific search values mentioned in the query
//   3. Map them to the appropriate search fields
//   4. If multiple criteria are mentioned, include all of them
//   5. Only extract explicit values — don't infer values not mentioned
// - Examples section showing query → field mappings:
//   - "Who is John?" → name: "John"
//   - "Find users with surname Smith" → surname: "Smith"
//   - "Look for john@example.com" → email: "john@example.com"
//   - "Find John Smith" → name: "John", surname: "Smith"
//   - Ambiguous query (e.g. "find users that love hiking") → no clear parameters (return empty list)
const QUERY_ANALYSIS_PROMPT = "";

// TODO:
// Define SYSTEM_PROMPT for the final answer generation (RAG assistant):
// - Role: RAG-powered assistant for user information questions
// - Describe the structure of the user message:
//   - `RAG CONTEXT`: retrieved documents relevant to the query
//   - `USER QUESTION`: the user's actual question
// - Instructions:
//   - Use RAG CONTEXT as context when answering USER QUESTION
//   - Cite specific sources from context
//   - Answer ONLY based on conversation history and RAG context
//   - If no relevant info exists, state that you cannot answer
//   - Be conversational and helpful; format user information clearly
const SYSTEM_PROMPT = "";

// TODO:
// Define getUserPrompt as a function (context: string, query: string) => string
// Use markdown-style section headers to separate the two parts:
// - "## RAG CONTEXT:" followed by the context
// - "## USER QUESTION:" followed by the query
const getUserPrompt = (context: string, query: string): string => "";

// TODO:
// Define SearchField as a Zod enum with three values: "name", "surname", "email"
const SearchField = z.enum([""]);

// TODO:
// Define SearchRequest as a Zod object with two fields:
// - searchField: SearchField
// - searchValue: z.string()
const SearchRequest = z.object({});

// TODO:
// Define SearchRequests as a Zod object with one field:
// - searchRequestParams: z.array(SearchRequest)
const SearchRequests = z.object({});

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });
const userService = new UserServiceClient();


/**
 * Extracts structured search parameters from a natural-language user request,
 * then fetches matching users from the User Service.
 *
 * @param userRequest - The raw natural-language query from the user.
 * @returns An array of matching user objects, or an empty array if no search
 *          parameters could be extracted.
 */
async function retrieveContext(userRequest: string): Promise<any[]> {
  // TODO:
  // 1. Build a messages array with:
  //    - { role: "system", content: QUERY_ANALYSIS_PROMPT }
  //    - { role: "user",   content: userRequest }
  // 2. Call llmClient.beta.chat.completions.parse() with:
  //    - model: "gpt-4.1-nano"
  //    - temperature: 0
  //    - messages
  //    - response_format: zodResponseFormat(SearchRequests, "searchRequests")
  // 3. Extract parsed (SearchRequests) from response.choices[0].message.parsed
  // 4. If parsed.searchRequestParams is non-empty:
  //    - Build a params object mapping each entry's searchField → searchValue
  //    - Print `Searching with parameters: ${JSON.stringify(params)}`
  //    - Return userService.searchUsers(params)
  // 5. Otherwise:
  //    - Print "No specific search parameters found!"
  //    - Return []
  throw new Error("Not implemented");
}

/**
 * Builds the augmented user prompt by formatting the retrieved context and
 * combining it with the original user request.
 *
 * @param userRequest - The original user question.
 * @param context     - Array of user objects retrieved from the User Service.
 * @returns The augmented prompt string ready to be sent to the LLM.
 */
async function augmentPrompt(userRequest: string, context: Array<any>): Promise<string> {
  // TODO:
  // 1. Build contextStr by iterating over context (array of user objects):
  //    - For each user: start with "User:\n", then for each key-value pair append `  ${key}: ${value}\n`, then "\n"
  // 2. Call getUserPrompt(contextStr, userRequest) to build the augmented prompt
  // 3. Print the augmented prompt
  // 4. Return the augmented prompt string
  throw new Error("Not implemented");
}

/**
 * Sends the augmented prompt to the LLM and returns the generated answer.
 *
 * @param augmentedPrompt - The prompt that includes both the RAG context and the user question.
 * @returns The assistant's response content string.
 */
async function generateAnswer(augmentedPrompt: string): Promise<string> {
  // TODO:
  // 1. Build a messages array with:
  //    - { role: "system", content: SYSTEM_PROMPT }
  //    - { role: "user",   content: augmentedPrompt }
  // 2. Call llmClient.chat.completions.create() with:
  //    - model: "gpt-4.1-mini"
  //    - temperature: 0
  //    - messages
  // 3. Return response.choices[0].message.content (default to "")
  throw new Error("Not implemented");
}

async function main() {
  // TODO:
  // 1. Print query samples:
  //    - "Query samples:"
  //    - " - I need user emails that filled with hiking and psychology"
  //    - " - Who is John?"
  //    - " - Find users with surname Adams"
  //    - " - Do we have smbd with name John that love painting?"
  // 2. Start a while(true) loop:
  //   2.1. Read userRequest from stdin (use process.stdin / readline or a simple prompt — "> ")
  //   2.2. If userRequest is empty: continue
  //   2.3. If userRequest.toLowerCase() is "quit" or "exit": break
  //   2.4. Print "\n--- Retrieving context ---"
  //   2.5. Call retrieveContext(userRequest) → context
  //   2.6. If context is non-empty:
  //        - Print "\n--- Augmenting prompt ---"
  //        - Call augmentPrompt(userRequest, context) → augmentedPrompt
  //        - Print "\n--- Generating answer ---"
  //        - Call generateAnswer(augmentedPrompt) → answer
  //        - Print `\nAnswer: ${answer}\n`
  //   2.7. Otherwise: print "\n--- No relevant information found ---"
  throw new Error("Not implemented");
}

main();

// The problems with API based Grounding approach are:
//   - We need a Pre-Step to figure out what field should be used for search (Takes time)
//   - Values for search should be correct (✅ John -> ❌ Jonh)
//   - Is not so flexible
// Benefits are:
//   - We fetch actual data (new users added and deleted every 5 minutes)
//   - Costs reduce
