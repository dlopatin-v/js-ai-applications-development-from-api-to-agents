import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { OPENAI_API_KEY } from "../../commons";
import { UserServiceClient } from "../user_service_client";

/*
 HOBBIES SEARCHER:
 Searches users by hobbies and provides their full info in JSON format:
 Input: I need to gather people that love to go to mountains
 Output:
    rock climbing: [{full user info JSON},...],
    hiking: [{full user info JSON},...],
    camping: [{full user info JSON},...]
*/

// TODO:
// Define SYSTEM_PROMPT for the hobby-grouping RAG assistant:
// - Role: RAG-powered assistant that groups users by their hobbies
// - Describe the flow step by step:
//   Step 1: User asks to search users by hobbies
//   Step 2: Vector store search finds the most relevant users
//   Step 3: Model receives CONTEXT (most relevant users with ID and info) + USER QUESTION
//   Step 4: Model groups users by hobby and returns response according to Response Format
const SYSTEM_PROMPT = "";

// TODO:
// Define USER_PROMPT as a template string with two placeholders:
// - {context} — the formatted retrieved user data
// - {query}   — the user's question
// Use markdown-style section headers (## CONTEXT and ## USER QUESTION)
const USER_PROMPT = "";

// TODO:
// Implement getUserPrompt(context: string, query: string): string
// Replace {context} and {query} placeholders in USER_PROMPT with the provided values
const getUserPrompt = (context: string, query: string): string => "";

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });

// TODO:
// Define GroupingResultSchema as a Zod object with two fields:
// - hobby: z.string() — with description "Hobby. Example: football, painting, horsing, photography, bird watching..."
// - userIds: z.array(z.number().int()) — with description "List of user IDs that have hobby requested by user."
const GroupingResultSchema = z.object({});

// TODO:
// Define GroupingResultsSchema as a Zod object with one field:
// - groupingResults: z.array(GroupingResultSchema) — with description "List matching search results."
const GroupingResultsSchema = z.object({});

type GroupingResult = z.infer<typeof GroupingResultSchema>;
type GroupingResults = z.infer<typeof GroupingResultsSchema>;

// ---

function formatUserDocument(user: Record<string, any>): string {
  // TODO:
  // Return a formatted string including only id and about_me:
  // `User:\n id: ${user["id"]},\nAbout user: ${user["about_me"]}\n`
  throw new Error("Not implemented");
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
    // TODO:
    // - Assign this.llmClient = llmClient
    // - Assign this.userService = new UserServiceClient()
    // - Assign this.vectorStore = undefined (or leave unset)
    // - Assign this.ready = this.initializeVectorstore()
    throw new Error("Not implemented");
  }

  /**
   * Bootstraps the Chroma vector store by fetching all users and embedding them.
   *
   * @param batchSize - Number of documents per add batch (default 50).
   */
  private async initializeVectorstore(batchSize: number = 50): Promise<void> {
    // TODO:
    // 1. Print "🔍 Loading all users for initial vectorstore..."
    // 2. Fetch all users via this.userService.getAllUsers()
    // 3. Build a Document[] where each Document has:
    //    - pageContent: formatUserDocument(user)
    //    - metadata: { user_id: user.id } (or id as string for Chroma compatibility)
    // 4. Split documents into batches of batchSize using chunkArray()
    // 5. Print "Setup vectorstore..."
    // 6. Create this.vectorStore = new Chroma(this.embeddings, { collectionName: "users" })
    // 7. Run addDocuments for each batch in parallel with Promise.all()
    // 8. Print "Setup FINISHED"
    throw new Error("Not implemented");
  }

  /**
   * Incrementally syncs the Chroma vector store with the current state of the
   * User Service (adds new users, removes deleted ones).
   */
  private async updateVectorstore(): Promise<void> {
    // TODO:
    // 1. Fetch all current users via this.userService.getAllUsers()
    // 2. Get existing entries from the Chroma collection:
    //    const collection = await this.vectorStore.ensureCollection()
    //    const vectorstoreData = await collection.get()
    // 3. Build vectorstoreIdsSet: Set of string IDs from vectorstoreData.ids
    // 4. Build usersDict: Map of string user ID → user object
    // 5. Build usersIdsSet: Set of keys from usersDict
    // 6. Compute newUserIds = usersIdsSet - vectorstoreIdsSet
    // 7. Compute idsToDelete = vectorstoreIdsSet - usersIdsSet
    // 8. Build newDocuments from newUserIds (pageContent + metadata)
    // 9. If idsToDelete is non-empty: call this.vectorStore.delete({ ids: [...idsToDelete] })
    // 10. If newDocuments is non-empty:
    //     - If > 50: split into batches and run addDocuments in parallel
    //     - Otherwise: await this.vectorStore.addDocuments(newDocuments)
    throw new Error("Not implemented");
  }

  /**
   * Performs a semantic similarity search and returns a formatted context string.
   *
   * @param query  - The user's natural-language query.
   * @param k      - Maximum number of results to retrieve (default 100).
   * @param score  - Maximum L2 distance to accept (default 0.2).
   * @returns Joined context string of matching user documents.
   */
  async retrieveContext(query: string, k: number = 100, score: number = 0.2): Promise<string> {
    // TODO:
    // 1. If this.vectorStore is not initialised: await this.initializeVectorstore()
    //    Otherwise: await this.updateVectorstore()
    // 2. Print "Retrieving context..."
    // 3. Call this.vectorStore.similaritySearchWithScore(query, k)
    //    Note: JS Chroma returns raw L2 distances (lower = more similar)
    // 4. Filter results where distance <= score
    // 5. For each [doc, distance] in filtered results:
    //    - Print `Retrieved (Score: ${distance.toFixed(3)}): ${doc.pageContent}`
    //    - Collect doc.pageContent into a contextParts array
    // 6. Print "=".repeat(100) + "\n"
    // 7. Return contextParts.join("\n\n")
    throw new Error("Not implemented");
  }

  augmentPrompt(query: string, context: string): string {
    // TODO:
    // Call getUserPrompt(context, query) and return the result
    throw new Error("Not implemented");
  }

  /**
   * Sends the augmented prompt to the LLM and returns a structured grouping result.
   *
   * @param augmentedPrompt - Prompt containing the RAG context and user question.
   * @returns Parsed GroupingResults with hobby → userIds mappings.
   */
  async generateAnswer(augmentedPrompt: string): Promise<GroupingResults> {
    // TODO:
    // 1. Build a messages array with:
    //    - { role: "system", content: SYSTEM_PROMPT }
    //    - { role: "user",   content: augmentedPrompt }
    // 2. Call this.llmClient.beta.chat.completions.parse() with:
    //    - model: "gpt-4.1-nano"
    //    - temperature: 0
    //    - messages
    //    - response_format: zodResponseFormat(GroupingResultsSchema, "groupingResults")
    // 3. Return response.choices[0].message.parsed as GroupingResults
    throw new Error("Not implemented");
  }
}

class OutputGrounder {
  private userService: UserServiceClient;

  constructor() {
    // TODO:
    // - Assign this.userService = new UserServiceClient()
    throw new Error("Not implemented");
  }

  /**
   * Fetches full user records for each hobby group and logs the results.
   *
   * @param groupingResults - The structured LLM output mapping hobbies to user IDs.
   */
  async groundResponse(groupingResults: GroupingResults): Promise<void> {
    // TODO:
    // Iterate over groupingResults.groupingResults:
    // - For each groupingResult:
    //   - Print `Hobby: ${groupingResult.hobby}`
    //   - Fetch users: await this._findUsers(groupingResult.userIds)
    //   - Print `Users: ${JSON.stringify(users)}`
    //   - Print "----------"
    throw new Error("Not implemented");
  }

  /**
   * Fetches user records by ID, tolerating 404 (user not found) errors.
   *
   * @param ids - Array of user IDs to look up.
   * @returns Array of successfully fetched user objects (non-null results only).
   */
  private async _findUsers(ids: Array<number>): Promise<Record<string, any>[]> {
    // TODO:
    // 1. For each id, call this.userService.getUser(id) inside a try/catch:
    //    - On 404-like error: log the missing ID and return null
    //    - On other errors: re-throw
    // 2. Run all calls in parallel with Promise.all()
    // 3. Return only the non-null results
    throw new Error("Not implemented");
  }
}

async function main() {
  // TODO:
  // 1. Create OpenAIEmbeddings with:
  //    - model: "text-embedding-3-small"
  //    - apiKey: OPENAI_API_KEY
  //    - dimensions: 384
  // 2. Create outputGrounder = new OutputGrounder()
  // 3. Create inputGrounder = new InputGrounder(embeddings, llmClient) and await inputGrounder.ready
  // 4. Print "Query samples:" and sample queries:
  //    " - I need people who love to go to mountains"
  //    " - Find people who love to watch stars and night sky"
  //    " - I need people to go to fishing together"
  // 5. Start a while(true) loop:
  //   5.1. Read userQuestion from stdin (use readline or a simple prompt — "> ")
  //   5.2. If userQuestion.toLowerCase() is "quit" or "exit": print "👋 Goodbye" and break
  //   5.3. Call inputGrounder.retrieveContext(userQuestion) → context (await)
  //   5.4. Call inputGrounder.augmentPrompt(userQuestion, context) → augmentedPrompt
  //   5.5. Call inputGrounder.generateAnswer(augmentedPrompt) → groupingResults (await)
  //   5.6. Call outputGrounder.groundResponse(groupingResults) (await)
  throw new Error("Not implemented");
}

main();
