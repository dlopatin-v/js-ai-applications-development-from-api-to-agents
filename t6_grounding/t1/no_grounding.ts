import { OpenAI } from "openai";

import { UserServiceClient } from "../user_service_client";

import { OPENAI_API_KEY } from "../../commons";

// TODO:
// Define BATCH_SYSTEM_PROMPT for the first LLM pass (batch search):
// - Role: user search assistant
// - Task: find users from the provided list that match the search criteria
// - Instructions:
//   1. Analyze the user question to understand what attributes are being searched for
//   2. Examine each user in the context and determine if they match
//   3. For matching users, return their complete information
//   4. Be inclusive — if a user partially matches, include them
// - Output format:
//   - Matching users: return their full details as provided
//   - No matches: respond with exactly "NO_MATCHES_FOUND"
//   - Uncertain: include the user with a note about why they might match
const BATCH_SYSTEM_PROMPT = "";

// TODO:
// Define FINAL_SYSTEM_PROMPT for the second LLM pass (result compilation):
// - Role: helpful assistant that answers based on user search results
// - Instructions:
//   1. Review all search results from different batches
//   2. Combine and deduplicate matching users found across batches
//   3. Present information in a clear, organized manner
//   4. If multiple users match, group them logically
//   5. If no users match, explain what was searched and suggest alternatives
const FINAL_SYSTEM_PROMPT = "";

// TODO:
// Define USER_PROMPT as a function (context: string, query: string) => string
// Use markdown-style section headers to separate the two parts:
// - "## USER DATA:" followed by the context
// - "## SEARCH QUERY:" followed by the query
const getUserPrompt = (context: string, query: string): string => "";


class TokenTracker {
  // TODO:
  // Declare two private instance fields:
  // - totalTokens: number, initialized to 0
  // - batchTokens: number[], initialized to []

  addTokens(tokens: number): void {
    // TODO:
    // 1. Add tokens to totalTokens
    // 2. Push tokens onto batchTokens
    throw new Error("Not implemented");
  }

  getSummary() {
    // TODO:
    // Return an object with:
    // - totalTokens: this.totalTokens
    // - batchCount: length of batchTokens
    // - batchTokens: this.batchTokens
    throw new Error("Not implemented");
  }
}

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });
const tokenTracker = new TokenTracker();
const userService = new UserServiceClient();


/**
 * Converts an array of user objects into a single formatted context string.
 *
 * @param context - Array of user objects to format.
 * @returns A single string with each user rendered as:
 *   "User:\n  key: value\n  key: value\n\n"
 */
function joinContext(context: Array<any>): string {
  // TODO:
  // For each user object in context:
  //   - Start with "User:\n"
  //   - For each key-value pair in the object: append `  ${key}: ${value}\n`
  //   - Append "\n" after each user to separate entries
  // Join all user blocks into a single string and return it.
  throw new Error("Not implemented");
}

/**
 * Sends a single chat completion request to OpenAI and tracks token usage.
 *
 * @param systemPrompt - The system message content.
 * @param userMessage  - The user message content.
 * @returns The assistant's response content string.
 */
async function generateResponse(systemPrompt: string, userMessage: string): Promise<string> {
  // TODO:
  // 1. Print "Processing..."
  // 2. Build a messages array with:
  //    - { role: "system", content: systemPrompt }
  //    - { role: "user",   content: userMessage  }
  // 3. Call llmClient.chat.completions.create with:
  //    - model: "gpt-4.1-nano"
  //    - temperature: 0
  //    - messages
  // 4. Extract totalTokens from response.usage?.total_tokens (default to 0)
  // 5. Track tokens via tokenTracker.addTokens(totalTokens)
  // 6. Extract content from response.choices[0].message.content (default to "")
  // 7. Print `Response: \n ${content}\nTokens used: ${totalTokens}\n`
  // 8. Return content
  throw new Error("Not implemented");
}

async function main() {
  // TODO:
  // 1. Print query samples to guide the user:
  //    - "Query samples:"
  //    - " - Do we have someone with name John that loves traveling?"
  // 2. Read userQuestion from stdin (use process.stdin / readline or a simple prompt).
  // 3. If userQuestion is empty, return early.
  // 4. Print "\n--- Searching user database ---"
  // 5. Fetch all users via userService.getAllUsers().
  // 6. Split users into batches of 100:
  //    [users[i:i + 100] for i in range(0, len(users), 100)]
  // 7. Build a Promise for each batch calling generateResponse() with BATCH_SYSTEM_PROMPT
  //    and getUserPrompt(joinContext(batch), userQuestion) as the user message.
  // 8. Run all batch Promises in parallel with Promise.all().
  // 9. Print "\n--- Compiling results ---"
  // 10. Filter batchResults: keep only results that are NOT "NO_MATCHES_FOUND".
  // 11. Print "\n=== SEARCH RESULTS ==="
  // 12. If relevantResults is non-empty:
  //     - Join them with "\n\n"
  //     - Call generateResponse() with FINAL_SYSTEM_PROMPT and the combined results + original query
  // 13. Otherwise:
  //     - Print `No users found matching '${userQuestion}'`
  //     - Print "Try refining your search or using different keywords."
  // 14. Retrieve summary from tokenTracker.getSummary()
  // 15. Print performance stats:
  //     - "\n=== Performance ==="
  //     - `Total API calls: ${summary.batchCount}`
  //     - `Total tokens: ${summary.totalTokens}`
  throw new Error("Not implemented");
}

main();

// The problems with No Grounding approach are:
//   - If we load whole users as context in one request to LLM we will hit context window
//   - Huge token usage == Higher price per request
//   - Added + one chain in flow where original user data can be changed by LLM (before final generation)
// User Question -> Get all users -> ‼️parallel search of possible candidates‼️ -> probably changed original context -> final generation
