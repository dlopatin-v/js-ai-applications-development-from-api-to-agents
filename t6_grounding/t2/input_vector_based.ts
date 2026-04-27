import * as readline from "node:readline/promises";

import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "openai";

import { UserServiceClient } from "../user_service_client";

import { OPENAI_API_KEY, Role, UserInfo } from "../../commons";

// TODO:
// Define SYSTEM_PROMPT for the RAG assistant:
// - Role: RAG-powered assistant for user information questions
// - Describe the structure of the user message:
//   - `RAG CONTEXT`: retrieved documents relevant to the query
//   - `USER QUESTION`: the user's actual question
// - Instructions:
//   - Use RAG CONTEXT as context when answering USER QUESTION
//   - Cite specific sources from context
//   - Answer ONLY based on conversation history and RAG context
//   - If no relevant info exists, state that you cannot answer
const SYSTEM_PROMPT = "";

// TODO:
// Define getUserPrompt as a function (context: string, query: string) => string
// Use markdown-style section headers to separate the two parts:
// - "## RAG CONTEXT:" followed by the context
// - "## USER QUESTION:" followed by the query
const getUserPrompt = (context: string, query: string): string => "";


/**
 * Converts a single user object into a formatted document string.
 *
 * @param user - A user object with arbitrary key-value pairs.
 * @returns A string in the format:
 *   "User:\n  key: value\n  key: value\n\n"
 */
function formatUserDocument(user: Record<string, any>): string {
  // TODO:
  // - Start with "User:\n"
  // - For each key-value pair in the user object: append `  ${key}: ${value}\n`
  // - Append "\n" at the end
  // - Return the complete string
  throw new Error("Not implemented");
}

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

class UserRAG {
  private vectorStore!: FaissStore;
  private llmClient!: OpenAI;
  private userService!: UserServiceClient;

  readonly ready: Promise<void>;

  constructor(private embeddings: OpenAIEmbeddings) {
    // TODO:
    // - Assign this.llmClient = new OpenAI({ apiKey: OPENAI_API_KEY })
    // - Assign this.userService = new UserServiceClient()
    // - Assign this.ready = this.initialize()
    throw new Error("Not implemented");
  }

  /**
   * Bootstraps the vector store by fetching all users and embedding them.
   * Called automatically in the constructor via `this.ready`.
   */
  private async initialize(): Promise<void> {
    // TODO:
    // 1. Print "🔎 Loading all users..."
    // 2. Fetch all users via this.userService.getAllUsers()
    // 3. Print `Formatting ${users.length} user documents...`
    // 4. Build a Document[] by calling formatUserDocument(user) for each user
    //    and wrapping the result in new Document({ pageContent: ... })
    // 5. Print `↗️ Creating embeddings and vectorstore for ${documents.length} documents...`
    // 6. Call this.createVectorStoreWithBatching(documents) and assign to this.vectorStore
    // 7. Print "✅ Vectorstore is ready."
    throw new Error("Not implemented");
  }

  /**
   * Creates a FAISS vector store from documents in batches to avoid
   * embedding API rate limits.
   *
   * @param documents - Array of LangChain Documents to embed.
   * @param batchSize - Number of documents per embedding batch (default 100).
   * @returns A merged FaissStore containing all documents.
   */
  private async createVectorStoreWithBatching(
    documents: Document[],
    batchSize: number = 100
  ): Promise<FaissStore> {
    // TODO:
    // 1. Split documents into batches of batchSize using chunkArray()
    // 2. Create a FaissStore Promise for each batch with FaissStore.fromDocuments(batch, this.embeddings)
    // 3. Run all Promises in parallel with Promise.all()
    // 4. Merge all stores into the first one:
    //    - Start with baseStore = stores[0]
    //    - For each remaining store: call baseStore.mergeFrom(store)
    // 5. Return the merged FaissStore
    throw new Error("Not implemented");
  }

  /**
   * Performs a semantic similarity search against the vector store and
   * returns a formatted context string.
   *
   * @param query          - The user's natural-language query.
   * @param k              - Maximum number of results to retrieve (default 10).
   * @param scoreThreshold - Maximum L2 distance to accept (default 1.0).
   *                         Note: JS FAISS returns raw L2 distances (lower = more similar).
   * @returns Joined context string of matching user documents.
   */
  async retrieveContext(
    query: string,
    k: number = 10,
    scoreThreshold: number = 1.0
  ): Promise<string> {
    // TODO:
    // 1. Print "Retrieving context..."
    // 2. Call this.vectorStore.similaritySearchWithScore(query, k)
    //    Note: JS FAISS returns raw L2 distances (lower = more similar)
    // 3. Filter results where distance <= scoreThreshold
    // 4. For each [doc, distance] in filtered results:
    //    - Print `Retrieved (Score: ${distance.toFixed(3)}): ${doc.pageContent}`
    //    - Collect doc.pageContent into a contextParts array
    // 5. Print "=".repeat(100) + "\n"
    // 6. Return contextParts.join("\n\n")
    throw new Error("Not implemented");
  }

  augmentPrompt(query: string, context: string): string {
    // TODO:
    // Call getUserPrompt(context, query) and return the result
    throw new Error("Not implemented");
  }

  /**
   * Sends the augmented prompt to the LLM and returns the answer.
   *
   * @param augmentedPrompt - The prompt containing RAG context and user question.
   * @returns The assistant's response content string.
   */
  async generateAnswer(augmentedPrompt: string): Promise<string> {
    // TODO:
    // 1. Build a messages array with:
    //    - { role: "system", content: SYSTEM_PROMPT }
    //    - { role: "user",   content: augmentedPrompt }
    // 2. Call this.llmClient.chat.completions.create() with:
    //    - model: "gpt-4.1-mini"
    //    - temperature: 0
    //    - messages
    // 3. Return response.choices[0].message.content (default to "")
    throw new Error("Not implemented");
  }
}

async function main() {
  // TODO:
  // 1. Create OpenAIEmbeddings with:
  //    - model: "text-embedding-3-small"
  //    - apiKey: OPENAI_API_KEY
  //    - dimensions: 384
  // 2. Create new UserRAG(embeddings) and await rag.ready
  // 3. Print "Query samples:" and sample queries:
  //    " - I need user emails that filled with hiking and psychology"
  //    " - Who is John?"
  // 4. Start a while(true) loop:
  //   4.1. Read userRequest from stdin (use readline or a simple prompt — "> ")
  //   4.2. If userRequest.toLowerCase() is "quit" or "exit": break
  //   4.3. Call rag.retrieveContext(userRequest) → context (await)
  //   4.4. Call rag.augmentPrompt(userRequest, context) → augmentedPrompt
  //   4.5. Call rag.generateAnswer(augmentedPrompt) → answer (await)
  //   4.6. Print answer
  throw new Error("Not implemented");
}

main();

// The problems with Vector based Grounding approach are:
//   - In current solution we fetched all users once, prepared Vector store (Embed takes money) but we didn't play
//     around the point that new users added and deleted every 5 minutes. (Actually, it can be fixed, we can create once
//     Vector store and with new request we will fetch all the users, compare new and deleted with version in Vector
//     store and delete the data about deleted users and add new users).
//   - Limit with top_k (we can set up to 100, but what if the real number of similarity search 100+?)
//   - With some requests works not so perfectly. (Here we can play and add extra chain with LLM that will refactor the
//     user question in a way that will help for Vector search, but it is also not okay in the point that we have
//     changed original user question).
//   - Need to play with balance between top_k and score_threshold
// Benefits are:
//   - Similarity search by context
//   - Any input can be used for search
//   - Costs reduce
