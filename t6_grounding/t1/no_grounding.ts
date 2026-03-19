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
  return context
    .map(user => {
      const userDetails = Object.entries(user)
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');
      return `User:\n${userDetails}\n`;
    })
    .join('');
}

function chunkArray(array, size) {
  return Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

async function generateResponse(systemPrompt: string, userMessage: string) {
  console.log("Processing...");

  const messages = [
    {role: Role.SYSTEM, content: systemPrompt},
    {role: Role.USER, content: userMessage},
  ]
  const response = await llmClient.chat.completions.create({
    model: "gpt-4.1-nano", temperature: 0, messages: messages as any[]
  });

  const totalTokens = response.usage.total_tokens ?? 0;
  const content = response.choices[0].message.content;

  tokenTracker.addTokens(totalTokens);

  console.log(`Response: \\n ${content}\\nTokens used: ${totalTokens}\\n`);
  return content;
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

  const users = await userService.getAllUsers();
  const userBatches = chunkArray(users, 100);

  const batchResults = await Promise.all(userBatches.map(async (batch) =>
    generateResponse(BATCH_SYSTEM_PROMPT, getUserPrompt(joinContext(batch), userQuestion))
  ));

  console.log("\n--- Compiling results ---");

  const relevantResults = batchResults.filter(result => result.trim() !== "NO_MATCHES_FOUND");

  console.log("\n=== SEARCH RESULTS ===");

  if (relevantResults.length > 0) {

    const combinedResults = relevantResults.join("\n\n");
    await generateResponse(FINAL_SYSTEM_PROMPT, `SEARCH RESULTS:\n${combinedResults}\n\nORIGINAL QUERY: ${userQuestion}`);

  } else {

    console.log("\n=== SEARCH RESULTS ===");
    console.log("No users found matching '{user_question}'");
    console.log("\nTry refining your search or using different keywords.");

  }

  const summary = tokenTracker.getSummary();
  console.log(`\n=== Performance ===`);
  console.log(`Total API calls: ${summary.batchCount}`);
  console.log(`Total tokens: ${summary.totalTokens}`);
  rl.close();
}

main();