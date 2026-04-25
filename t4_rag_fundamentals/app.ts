import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline/promises";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OPENAI_API_KEY } from "../commons";

// @TODO:
// Create a system prompt that:
//   - Defines the assistant's role (microwave manual expert)
//   - Describes the structure of the user message:
//       - `RAG CONTEXT`: retrieved document chunks
//       - `USER QUESTION`: the actual user question
//   - Instructs the model to answer ONLY from the RAG context / conversation history
//   - Instructs it to refuse questions not covered by the context
const SYSTEM_PROMPT = `NEED_TO_IMPLEMENT`;

// Template that injects retrieved context and the user question into a single prompt string
const getUserPrompt = (context: string, query: string) => `##RAG CONTEXT:
${context}


##USER QUESTION: 
${query}`;

class MicrowaveRAG {
  vectorStore!: FaissStore;

  /** Resolves when the vector store is fully initialised and ready for queries. */
  readonly ready: Promise<void>;

  constructor(
    public embeddings: OpenAIEmbeddings,
    public llmClient: ChatOpenAI
  ) {
    this.ready = this.setupVectorStore();
  }

  // @TODO:
  // Check if the FAISS index folder already exists on disk.
  //   - If yes: load it with FaissStore.load()
  //   - If no:  call createNewIndex() to build and save a fresh one
  private async setupVectorStore(): Promise<void> {
    throw new Error("Not implemented");
  }

  // @TODO:
  // Build a new FAISS index from the microwave manual:
  //   - Load 'microwave_manual.txt' with TextLoader
  //   - Split into chunks with RecursiveCharacterTextSplitter
  //   - Create the store with FaissStore.fromDocuments()
  //   - Save the index locally for future runs
  private async createNewIndex(): Promise<FaissStore> {
    throw new Error("Not implemented");
  }

  // @TODO:
  // Search the vector store for chunks most relevant to the query.
  //   - Use similaritySearchWithScore(query, k)
  //   - Print each chunk's L2 distance score and content
  //   - Return all matching chunks joined with "\n\n"
  // ---
  // Hint: try different values of `k` and `scoreThreshold` to see how they
  //       affect retrieval quality and LLM answer accuracy.
  //       Note: scoreThreshold is a maximum L2 distance (lower = more similar).
  //       FAISS does NOT return 0–1 relevance scores — a value of 1.0 may be
  //       too strict for some queries and return no results at all. Try 0.5–2.0.
  async retrieveContext(query: string, k = 4, scoreThreshold = 1.0): Promise<string> {
    throw new Error("Not implemented");
  }

  // @TODO:
  // Format the user prompt by injecting context and query into getUserPrompt().
  //   - Print the formatted prompt
  //   - Return the formatted string
  augmentPrompt(context: string, query: string): string {
    throw new Error("Not implemented");
  }

  // @TODO:
  // Send the augmented prompt to the LLM and return its answer.
  //   - Build a messages array: [SystemMessage(SYSTEM_PROMPT), HumanMessage(augmentedPrompt)]
  //   - Invoke llmClient and print the response content
  //   - Return the response content as a string
  async generateAnswer(augmentedPrompt: string): Promise<string> {
    throw new Error("Not implemented");
  }
}

const main = async (rag: MicrowaveRAG) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🎯 Microwave RAG Assistant");
  console.log("Type your question or 'exit' to quit.");

  while (true) {
    const input = await rl.question("➡️  ");

    if (input.trim() === "exit") {
      console.log("Exiting the chat. Goodbye!");
      rl.close();
      process.exit(0);
    }

    // @TODO:
    // Execute the 3-step RAG pipeline for each user question:
    //   Step 1 (Retrieval):   call rag.retrieveContext()  → context
    //   Step 2 (Augmentation): call rag.augmentPrompt()  → augmentedPrompt
    //   Step 3 (Generation):  call rag.generateAnswer()  → answer
    throw new Error("Not implemented");
  }
};

// @TODO:
// Instantiate MicrowaveRAG and start the chat loop:
//   - Create OpenAIEmbeddings with model "text-embedding-3-small"
//   - Create ChatOpenAI with model "gpt-4o" and temperature 0
//   - Construct MicrowaveRAG, await rag.ready, then call main(rag)
