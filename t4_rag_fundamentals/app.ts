import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline/promises";

import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { OPENAI_API_KEY } from "../commons";



const SYSTEM_PROMPT = `You are a RAG-powered assistant that assists users with their questions about microwave usage.
            
## Structure of User message:
\`RAG CONTEXT\` - Retrieved documents relevant to the query.
\`USER QUESTION\` - The user's actual question.

## Instructions:
- Use information from \`RAG CONTEXT\` as context when answering the \`USER QUESTION\`.
- Cite specific sources when using information from the context.
- Answer ONLY based on conversation history and RAG context.
- If no relevant information exists in \`RAG CONTEXT\` or conversation history, state that you cannot answer the question.
`;

// Template that combines retrieved context and the user question into one string
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
    // NOTE: constructors cannot be async in TypeScript/JavaScript.
    // We store the setup promise in `this.ready` so the caller can
    // await it before issuing any queries (see the bottom of the file).
    this.ready = this.setupVectorStore();
  }

  /**
   * Load an existing FAISS index from disk, or build a new one from the
   * microwave manual if none exists yet.
   */
  private async setupVectorStore(): Promise<void> {
    console.log("🔄 Initializing Microwave Manual RAG System...");

    //TODO:
    // 1. Build the absolute path to "microwave_faiss_index" using path.join(__dirname, "microwave_faiss_index")
    //    and assign it to `indexPath`
    // 2. Check whether the folder exists using fs.existsSync(indexPath)
    //    - If yes:
    //        a. Load the index: this.vectorStore = await FaissStore.load(indexPath, this.embeddings)
    //        b. console.log("✅ Loaded existing FAISS index")
    //    - If no:
    //        a. this.vectorStore = await this.createNewIndex()
    //        b. console.log("✅ RAG system initialized successfully!")
    throw new Error("Not implemented");
  }

  /**
   * Load the microwave manual, split it into overlapping chunks, embed each
   * chunk, and persist the resulting FAISS index to disk for reuse.
   *
   * @returns The newly created and saved {@link FaissStore}.
   */
  private async createNewIndex(): Promise<FaissStore> {
    console.log("📖 Loading text document...");

    //TODO:
    // 1. Create a TextLoader pointing to path.join(__dirname, "microwave_manual.txt")
    //    and call await loader.load() — assign the result to `documents`
    // 2. Create a RecursiveCharacterTextSplitter with:
    //      chunkSize: 300
    //      chunkOverlap: 50
    //      separators: ["\n\n", "\n", "."]
    // 3. Split documents: const chunks = await textSplitter.splitDocuments(documents)
    //    console.log(`✅ Created ${chunks.length} chunks`)
    // 4. Create the FAISS store:
    //      const vectorStore = await FaissStore.fromDocuments(chunks, this.embeddings)
    //    console.log("🔍 Creating embeddings and FAISS index...")
    // 5. Save the index to disk:
    //      await vectorStore.save(path.join(__dirname, "microwave_faiss_index"))
    //    console.log("💾 Index saved for future use")
    // 6. Return vectorStore
    throw new Error("Not implemented");
  }

  /**
   * Search the vector store for the most relevant chunks for a given query.
   *
   * @param query          - The user's question.
   * @param k              - Maximum number of chunks to retrieve. Try values
   *                         like 2, 4, 8 to see how answer quality changes.
   * @param scoreThreshold - Maximum L2 distance to accept (lower = more similar).
   *                         FaissStore returns raw L2 distances, not 0–1 scores.
   * @returns All matching chunks joined by `"\n\n"`.
   *
   * @todo Experiment with `k` and `scoreThreshold` to tune retrieval quality.
   */
  async retrieveContext(query: string, k = 4, scoreThreshold = 1.0): Promise<string> {
    console.log("=".repeat(100));
    console.log("\n🔍 STEP 1: RETRIEVAL\n");
    console.log("-".repeat(100));
    console.log(`Query: '${query}'`);
    console.log(`Searching for top ${k} most relevant chunks (L2 distance ≤ ${scoreThreshold}):`);

    //TODO:
    // 1. Call: const results = await this.vectorStore.similaritySearchWithScore(query, k)
    //    This returns [Document, number][] where the number is the L2 distance
    //    (lower distance = more similar to the query)
    // 2. Filter by threshold: results.filter(([, score]) => score <= scoreThreshold)
    // 3. For each [doc, score] in the filtered results:
    //      console.log(`\n--- (L2 Distance: ${score.toFixed(4)}) ---`)
    //      console.log(`Content: ${doc.pageContent}`)
    //    Collect doc.pageContent into an array
    // 4. console.log("=".repeat(100))
    // 5. Return the collected parts joined with "\n\n"
    throw new Error("Not implemented");
  }

  /**
   * Inject retrieved context and the user question into the prompt template.
   *
   * @param context - Retrieved chunks joined as a single string.
   * @param query   - The user's original question.
   * @returns The formatted prompt ready to be sent to the LLM.
   */
  augmentPrompt(context: string, query: string): string {
    console.log("\n🔗 STEP 2: AUGMENTATION\n");
    console.log("-".repeat(100));

    // @TODO:
    // 1. Call getUserPrompt(context, query) and assign to `augmentedPrompt`
    // 2. console.log(augmentedPrompt)
    // 3. console.log("=".repeat(100))
    // 4. Return augmentedPrompt
    throw new Error("Not implemented");
  }

  /**
   * Send the augmented prompt to the LLM and return the generated answer.
   *
   * @param augmentedPrompt - The prompt with injected RAG context and user question.
   * @returns The LLM-generated answer as a plain string.
   */
  async generateAnswer(augmentedPrompt: string): Promise<string> {
    console.log("\n🤖 STEP 3: GENERATION\n");
    console.log("-".repeat(100));

    //TODO:
    // 1. Build the messages array:
    //      const messages = [
    //        new SystemMessage(SYSTEM_PROMPT),
    //        new HumanMessage(augmentedPrompt),
    //      ]
    // 2. Invoke the LLM: const response = await this.llmClient.invoke(messages)
    // 3. console.log(response.content)
    // 4. console.log("=".repeat(100))
    // 5. Return response.content.toString()
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

    //TODO:
    // Execute the 3-step RAG pipeline:
    //   Step 1 (Retrieval):    const context = await rag.retrieveContext(input)
    //                          Here you can also pass custom k and scoreThreshold to tune results
    //   Step 2 (Augmentation): const augmentedPrompt = rag.augmentPrompt(context, input)
    //   Step 3 (Generation):   await rag.generateAnswer(augmentedPrompt)
    throw new Error("Not implemented");
  }
};

//TODO:
// 1. Create embeddings:
//      const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small", apiKey: OPENAI_API_KEY })
// 2. Create LLM client:
//      const llmClient = new ChatOpenAI({ model: "gpt-4o", temperature: 0, apiKey: OPENAI_API_KEY })
// 3. Wire everything together:
//      const rag = new MicrowaveRAG(embeddings, llmClient)
//      await rag.ready   // wait for the vector store to initialise
//      await main(rag)
// Wrap steps 3+ in an async IIFE: (async () => { ... })()
