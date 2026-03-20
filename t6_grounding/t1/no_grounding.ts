import { OpenAI } from "openai";
import { OPENAI_API_KEY, Role } from "../../commons";
import { UserServiceClient } from "../user_service_client";
import * as readline from "node:readline/promises";

const BATCH_SYSTEM_PROMPT = `You are a user search assistant. Your task is to find users from the provided list that match the search criteria.

INSTRUCTIONS:
1. Analyze the user question to understand what attributes/characteristics are being searched for
2. Examine each user in the context and determine if they match the search criteria
3. For matching users, extract and return their complete information
4. Be inclusive - if a user partially matches or could potentially match, include them

OUTPUT FORMAT:
- If you find matching users: Return their full details exactly as provided, maintaining the original format
- If no users match: Respond with exactly "NO_MATCHES_FOUND"
- If uncertain about a match: Include the user with a note about why they might match`;

const FINAL_SYSTEM_PROMPT = `You are a helpful assistant that provides comprehensive answers based on user search results.

INSTRUCTIONS:
1. Review all the search results from different user batches
2. Combine and deduplicate any matching users found across batches
3. Present the information in a clear, organized manner
4. If multiple users match, group them logically
5. If no users match, explain what was searched for and suggest alternatives`;

const getUserPrompt = (context: string, query: string) => (`## USER DATA:
${context}

## SEARCH QUERY: 
${query}`);

class TokenTracker {
  private totalTokens = 0;
  private batchTokens = [];

  addTokens(tokens: number) {
    this.totalTokens += tokens;
    this.batchTokens.push(tokens);
  }

  getSummary() {
    return {
      totalTokens: this.totalTokens,
      batchCount: this.batchTokens.length,
      batchTokens: this.batchTokens
    }
  }
}

const llmClient = new OpenAI({apiKey: OPENAI_API_KEY});
const tokenTracker = new TokenTracker();
const userService = new UserServiceClient();


// @TODO User type
function joinContext(context: Array<any>) {
  // TODO: Map each user object to a formatted string block:
  //   "User:\n  key: value\n  key: value\n\n"
  // and join all blocks into a single string.
  throw new Error("Not implemented");
}

function chunkArray(array, size) {
  // TODO: Split array into chunks of the given size.
  // Return: Array<Array<any>>
  throw new Error("Not implemented");
}

async function generateResponse(systemPrompt: string, userMessage: string) {
  console.log("Processing...");

  // TODO: Build messages array with systemPrompt and userMessage.
  // POST to OpenAI Chat Completions (gpt-4.1-nano, temperature 0).
  // Track token usage with tokenTracker.addTokens().
  // Log the response content and tokens used.
  // Return the content string.
  throw new Error("Not implemented");
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Query samples:");
  console.log(" - Do we have someone with name John that loves traveling?");

  const userQuestion = await rl.question(`➡️. `);
  if (!userQuestion) return;

  console.log("\n--- Searching user database ---");

  // TODO:
  // 1. Fetch all users via userService.getAllUsers().
  // 2. Split into batches of 100 with chunkArray().
  // 3. Send each batch in parallel to generateResponse() with BATCH_SYSTEM_PROMPT.
  // 4. Filter out "NO_MATCHES_FOUND" results.
  // 5. If any matches exist, combine them and call generateResponse() with FINAL_SYSTEM_PROMPT.
  //    Otherwise print "No users found matching '{user_question}'".
  // 6. Print the performance summary from tokenTracker.getSummary().
  throw new Error("Not implemented");
}

main();
