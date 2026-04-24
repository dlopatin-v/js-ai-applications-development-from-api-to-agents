import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import { OPENAI_API_KEY } from "../../commons";
import { UserServiceClient } from "../user_service_client";
import * as readline from "node:readline/promises";

// TODO:
// Define SYSTEM_PROMPT - instructs the LLM to act as a RAG-powered assistant:
//   - The user message contains two sections: RAG CONTEXT and USER QUESTION
//   - Answer ONLY based on the provided RAG CONTEXT and conversation history
//   - If no relevant information exists in RAG CONTEXT, state that the question cannot be answered
const SYSTEM_PROMPT = null;

// TODO:
// Define USER_PROMPT template with two placeholders:
//   - {context} - the retrieved user data
//   - {query}   - the user's question
const USER_PROMPT = null;


function formatUserDocument(user: Record<string, unknown>): string {
  // TODO:
  // - Build a string starting with "User:\n"
  // - For each key-value pair in the user object, add an indented "  key: value\n" line
  // - Add a blank line at the end
  // - Return the formatted string
  throw new Error("Not implemented");
}

class UserRAG {
  private vectorStore!: FaissStore;
  private llmClient: OpenAI;
  private userService: UserServiceClient;

  readonly ready: Promise<void>;

  constructor(private embeddings: OpenAIEmbeddings) {
    this.llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    this.userService = new UserServiceClient();
    this.ready = this.initialize();
  }

  private async initialize(): Promise<void> {
    // TODO:
    // - Print "🔎 Loading all users..."
    // - Fetch all users via userService.getAllUsers()
    // - Print `Formatting ${users.length} user documents...`
    // - Create a list of Document objects, each with pageContent = formatUserDocument(user)
    // - Print `↗️ Creating embeddings and vectorstore for ${documents.length} documents...`
    // - Call createVectorStoreWithBatching(documents, 100) and assign to this.vectorStore
    // - Print "✅ Vectorstore is ready."
    throw new Error("Not implemented");
  }

  private async createVectorStoreWithBatching(
    documents: Document[],
    batchSize: number = 100
  ): Promise<FaissStore> {
    // TODO:
    // - Split documents into batches of batch_size using list slicing
    // - Create a FaissStore promise for each batch with FaissStore.fromDocuments()
    // - Run all promises IN PARALLEL using Promise.all(...)
    // - Merge all stores into the first one with baseStore.mergeFrom()
    // - Return the merged FaissStore
    throw new Error("Not implemented");
  }

  async retrieveContext(
    query: string,
    k: number = 10,
    score: number = 0.1
  ): Promise<string> {
    console.log("Retrieving context...");
    // TODO:
    // - Call this.vectorStore.similaritySearchWithScore(query, k)
    // Note: JS returns raw L2 distances (lower = more similar).
    // - Filter results where distance <= score
    // - Log each retrieved document with its distance
    // - Return all context parts joined with "\n\n"
    throw new Error("Not implemented");
  }

  augmentPrompt(query: string, context: string): string {
    // TODO:
    // - Return USER_PROMPT formatted with context and query
    throw new Error("Not implemented");
  }

  async generateAnswer(augmentedPrompt: string): Promise<string> {
    // TODO:
    // - Build a messages array with SYSTEM_PROMPT as system and augmentedPrompt as user
    // - Call llmClient.chat.completions.create with model: 'gpt-4.1-mini', temperature: 0
    // - Return the response content string (default to "" if null)
    throw new Error("Not implemented");
  }
}

async function main() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: OPENAI_API_KEY,
    dimensions: 384,
  });

  const rag = new UserRAG(embeddings);
  await rag.ready;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Query samples:");
  console.log(" - I need user emails that filled with hiking and psychology");
  console.log(" - Who is John?");

  while (true) {
    const userQuestion = await rl.question("➡️ ");

    if (userQuestion.toLowerCase() === "exit") {
      console.log("👋 Goodbye");
      rl.close();
      process.exit(0);
    }

    // TODO:
    // - Call rag.retrieveContext(userQuestion) and store in context
    // - Call rag.augmentPrompt(userQuestion, context) and store in augmentedPrompt
    // - Call rag.generateAnswer(augmentedPrompt) and print the answer
    throw new Error("Not implemented");
  }
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
