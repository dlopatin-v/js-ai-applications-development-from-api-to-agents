import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { OPENAI_API_KEY, Role } from "../../commons";
import { UserServiceClient } from "../user_service_client";
import * as readline from "node:readline/promises";

/*
 HOBBIES SEARCHER:
 Searches users by hobbies and provides their full info in JSON format:
 Input: I need to gather people that love to go to mountains
 Output:
    rock climbing: [{full user info JSON},...],
    hiking: [{full user info JSON},...],
    camping: [{full user info JSON},...]
*/

const SYSTEM_PROMPT = `You are a RAG-powered assistant that groups users by their hobbies.

## Flow:
Step 1: User will ask to search users by their hobbies etc.
Step 2: Will be performed search in the Vector store to find most relevant users.
Step 3: You will be provided with CONTEXT (most relevant users, there will be user ID and information about user), and 
        with USER QUESTION.
Step 4: You group by hobby users that have such hobby and return response according to Response Format

`;

const USER_PROMPT = `## CONTEXT:
{context}

## USER QUESTION: 
{query}`;

const getUserPrompt = (context: string, query: string) =>
  USER_PROMPT.replace("{context}", context).replace("{query}", query);

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Zod schemas (mirror Python Pydantic models) ---

const GroupingResultSchema = z.object({
  hobby: z.string().describe("Hobby. Example: football, painting, horsing, photography, bird watching..."),
  userIds: z.array(z.number().int()).describe("List of user IDs that have hobby requested by user."),
});

const GroupingResultsSchema = z.object({
  groupingResults: z.array(GroupingResultSchema).describe("List matching search results."),
});

type GroupingResult = z.infer<typeof GroupingResultSchema>;
type GroupingResults = z.infer<typeof GroupingResultsSchema>;

// ---

function formatUserDocument(user: Record<string, any>): string {
  return `User:\n id: ${user["id"]},\nAbout user: ${user["about_me"]}\n`;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

class InputGrounder {
  private vectorStore!: Chroma;
  private llmClient: OpenAI;
  private userService: UserServiceClient;

  readonly ready: Promise<void>;

  constructor(private embeddings: OpenAIEmbeddings, llmClient: OpenAI) {
    this.llmClient = llmClient;
    this.userService = new UserServiceClient();
    this.ready = this.initializeVectorstore();
  }

  /**
   * Bootstraps the Chroma vector store by fetching all users and embedding them.
   *
   * Called automatically in the constructor via `this.ready`.
   * Maps each user to a LangChain `Document` (pageContent from `formatUserDocument`,
   * metadata = `{ user_id: user.id }`) and calls `Chroma.fromDocuments()` with
   * collectionName `"users"`.
   */
  private async initializeVectorstore(): Promise<void> {
    // TODO: Fetch all users with userService.getAllUsers().
    // Map each user to a Document: pageContent = formatUserDocument(user), metadata = { user_id: user.id }.
    // Create this.vectorStore via Chroma.fromDocuments() with collectionName "users".
    throw new Error("Not implemented");
  }

  /**
   * Incrementally syncs the Chroma vector store with the current state of the
   * User Service (adds new users, removes deleted ones).
   *
   * Fetch all current users, compare with existing Chroma IDs, delete stale
   * documents, and add new ones (batching if > 50).
   */
  private async updateVectorstore(): Promise<void> {
    // TODO: Fetch all current users.
    // Get existing IDs from the Chroma collection via this.vectorStore.ensureCollection() then collection.get().
    // Compute new user IDs (in fresh list but not in store) and deleted IDs (in store but not in fresh list).
    // Delete removed docs: this.vectorStore.delete({ ids: idsToDelete }).
    // Add new docs (batch if > 50): this.vectorStore.addDocuments().
    throw new Error("Not implemented");
  }

  /**
   * Performs a semantic similarity search and returns a formatted context string.
   *
   * Initialises or updates the vector store as needed, then calls
   * `similaritySearchWithScore`. Filters by `score` (raw L2 distance — lower
   * means more similar) and logs each result before returning the joined string.
   *
   * @param query  - The user's natural-language query.
   * @param k      - Maximum number of results to retrieve (default 100).
   * @param score  - Maximum L2 distance to accept (default 0.2).
   * @returns Joined context string of matching user documents.
   */
  async retrieveContext(query: string, k: number = 100, score: number = 0.2): Promise<string> {
    // TODO: If vectorStore not initialised, call initializeVectorstore(); otherwise call updateVectorstore().
    // Call this.vectorStore.similaritySearchWithScore(query, k).
    // Filter results where distance <= score (JS returns raw L2 distances; lower = more similar).
    // Log each retrieved doc with its distance.
    // Return joined context string.
    throw new Error("Not implemented");
  }

  augmentPrompt(query: string, context: string): string {
    return getUserPrompt(context, query);
  }

  /**
   * Sends the augmented prompt to the LLM and returns a structured grouping result.
   *
   * Uses `chat.completions.parse` with `zodResponseFormat` so the response is
   * automatically validated against `GroupingResultsSchema`.
   *
   * @param augmentedPrompt - Prompt containing the RAG context and user question.
   * @returns Parsed `GroupingResults` with hobby → userIds mappings.
   */
  async generateAnswer(augmentedPrompt: string): Promise<GroupingResults> {
    // TODO: Call llmClient.chat.completions.parse() with zodResponseFormat(GroupingResultsSchema, 'groupingResults').
    // Model: gpt-4.1-nano, temperature 0.
    // Return response.choices[0].message.parsed as GroupingResults.
    throw new Error("Not implemented");
  }
}

class OutputGrounder {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  /**
   * Fetches full user records for each hobby group and logs the results.
   *
   * Iterates over `groupingResults.groupingResults`, calls `_findUsers` for
   * each group's `userIds`, then logs the hobby name and the fetched user JSON.
   *
   * @param groupingResults - The structured LLM output mapping hobbies to user IDs.
   */
  async groundResponse(groupingResults: GroupingResults): Promise<void> {
    // TODO: Collect all userIds from groupingResults.groupingResults.
    // Fetch each user via _findUsers().
    // Log the hobby and the fetched users JSON.
    throw new Error("Not implemented");
  }

  /**
   * Fetches user records by ID, tolerating 404 (user not found) errors.
   *
   * For each id, calls `userService.getUser()`. Swallows 404-like errors by
   * logging the missing ID; re-throws all other errors.
   *
   * @param ids - Array of user IDs to look up.
   * @returns Array of successfully fetched user objects (non-null results only).
   */
  private async _findUsers(ids: Array<number>): Promise<Record<string, any>[]> {
    // TODO: For each id, call userService.getUser() wrapped in a try/catch.
    // Swallow 404 errors (log the missing ID); re-throw others.
    // Return an array of the non-null results.
    throw new Error("Not implemented");
  }
}

async function main() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: OPENAI_API_KEY,
    dimensions: 384,
  });

  const outputGrounder = new OutputGrounder();
  const inputGrounder = new InputGrounder(embeddings, llmClient);
  await inputGrounder.ready;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Query samples:");
  console.log(" - I need people who love to go to mountains");
  console.log(" - Find people who love to watch stars and night sky");
  console.log(" - I need people to go to fishing together");

  while (true) {
    const userQuestion = await rl.question("> ");

    if (userQuestion.toLowerCase() === "exit") {
      console.log("👋 Goodbye");
      rl.close();
      process.exit(0);
    }

    const context = await inputGrounder.retrieveContext(userQuestion);
    const augmentedPrompt = inputGrounder.augmentPrompt(userQuestion, context);
    const groupingResults = await inputGrounder.generateAnswer(augmentedPrompt);
    await outputGrounder.groundResponse(groupingResults);
  }
}

main();
