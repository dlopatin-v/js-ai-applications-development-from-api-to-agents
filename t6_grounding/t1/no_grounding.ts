import * as readline from "node:readline/promises";

import { OpenAI } from "openai";

import { UserServiceClient } from "../user_service_client";

import { OPENAI_API_KEY, Role, UserInfo } from "../../commons";

// TODO:
// Define BATCH_SYSTEM_PROMPT - instructs the LLM to act as a user search assistant:
//   - Analyze the search criteria from the user question
//   - Examine each user in the provided list and determine if they match
//   - Return full details of matching users in their original format
//   - Return exactly "NO_MATCHES_FOUND" if no users match
const BATCH_SYSTEM_PROMPT = null;

// TODO:
// Define FINAL_SYSTEM_PROMPT - instructs the LLM to compile final search results:
//   - Review all batch search results
//   - Combine and deduplicate matching users found across batches
//   - Present results in a clear, organized manner
const FINAL_SYSTEM_PROMPT = null;

// TODO:
// Define USER_PROMPT template with two placeholders:
//   - {context} - the formatted user data
//   - {query}   - the user's search question
const USER_PROMPT = null;


class TokenTracker {
  // TODO:
  // - Initialize totalTokens counter to 0
  // - Initialize batchTokens as an empty array to store per-batch token counts

  addTokens(tokens: number) {
    // TODO:
    // - Add tokens to the totalTokens counter
    // - Append tokens to the batchTokens array
    throw new Error("Not implemented");
  }

  getSummary() {
    // TODO:
    // - Return an object with:
    //   - totalTokens: total accumulated tokens
    //   - batchCount: number of batches processed (length of batchTokens array)
    //   - batchTokens: array of tokens per batch
    throw new Error("Not implemented");
  }
}


const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });
const tokenTracker = new TokenTracker();
const userService = new UserServiceClient();


function joinContext(context: Array<Record<string, unknown>>): string {
  // TODO:
  // - Initialize an empty string for the result
  // - Iterate through each user in the context array
  // - For each user, add a "User:" header line
  // - For each key-value pair in the user object, add an indented "  key: value" line
  // - Add a blank line after each user for readability
  // - Return the formatted string
  throw new Error("Not implemented");
}

async function generateResponse(systemPrompt: string, userMessage: string): Promise<string> {
  console.log("Processing...");

  // TODO:
  // - Build a messages array with systemPrompt as system and userMessage as user
  // - Call llmClient.chat.completions.create with:
  //   - model: 'gpt-4.1-nano'
  //   - temperature: 0
  //   - messages
  // - Extract total_tokens from response.usage (default to 0 if usage is null)
  // - Track tokens using tokenTracker.addTokens(...)
  // - Extract the content string from response.choices[0].message.content (default to "")
  // - Print the response content and token count to console
  // - Return the content string
  throw new Error("Not implemented");
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Query samples:");
  console.log(" - Do we have someone with name John that loves traveling?");

  const userQuestion = await rl.question(`➡️ `);
  if (!userQuestion) return;

  // TODO:
  // - Check if userQuestion is not empty, then:
  // 1. FETCH & BATCH USERS:
  //    - Print "\n--- Searching user database ---"
  //    - Fetch all users via userService.getAllUsers()
  //    - Split users into batches of 100 using list slicing
  //      Hint: [users[i:i + 100] for i in range(0, len(users), 100)]
  // 2. PARALLEL BATCH SEARCH:
  //    - Build a list of promises: for each batch call generateResponse(...)
  //      with BATCH_SYSTEM_PROMPT and USER_PROMPT formatted with joinContext(batch) and userQuestion
  //    - Run all promises IN PARALLEL using Promise.all(...)
  //    - Store results in batchResults
  // 3. FILTER RESULTS:
  //    - Print "\n--- Compiling results ---"
  //    - Filter batchResults to keep only results where result.trim() !== "NO_MATCHES_FOUND"
  //    - Store filtered results in relevantResults
  // 4. FINAL GENERATION:
  //    - Print "\n=== SEARCH RESULTS ==="
  //    - If relevantResults is not empty:
  //      - Join relevantResults with "\n\n" into combinedResults
  //      - Call generateResponse with FINAL_SYSTEM_PROMPT and a message combining
  //        combinedResults and userQuestion
  //    - Otherwise:
  //      - Print a "No users found" message and suggest refining the search
  // 5. PRINT PERFORMANCE SUMMARY:
  //    - Get the token usage summary from tokenTracker.getSummary()
  //    - Print "\n=== Performance ===" with total API calls (batchCount) and total tokens
  throw new Error("Not implemented");
}

main();


// The problems with No Grounding approach are:
//   - If we load whole users as context in one request to LLM we will hit context window
//   - Huge token usage == Higher price per request
//   - Added + one chain in flow where original user data can be changed by LLM (before final generation)
// User Question -> Get all users -> ‼️parallel search of possible candidates‼️ -> probably changed original context -> final generation
