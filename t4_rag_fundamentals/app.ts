import * as fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
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

const getUserPrompt = (context: string, query: string) => `##RAG CONTEXT:
${context}


##USER QUESTION: 
${query}`;

class MicrowaveRAG {
  vectorStore: FaissStore;

  /** Resolves when the vector store is fully initialised and ready for queries. */
  readonly ready: Promise<void>;

  constructor(
    public embeddings: OpenAIEmbeddings,
    public llmClient: ChatOpenAI
  ) {
    this.ready = this.setupVectorStore();
  }

  /**
   * Load an existing FAISS index from disk, or build a new one from the
   * microwave manual if none exists yet.
   */
  private async setupVectorStore(): Promise<void> {
    console.log("🔄 Initializing Microwave Manual RAG System...");

    const indexPath = path.join(__dirname, "microwave_faiss_index");

    if (fs.existsSync(indexPath)) {
      this.vectorStore = await FaissStore.load(indexPath, this.embeddings);
      console.log("✅ Loaded existing FAISS index");
    } else {
      this.vectorStore = await this.createNewIndex();
      console.log("✅ RAG system initialized successfully!");
    }
  }

  /**
   * Load the microwave manual, split it into overlapping chunks, embed each
   * chunk, and persist the resulting FAISS index to disk for reuse.
   *
   * @returns The newly created and saved {@link FaissStore}.
   */
  private async createNewIndex(): Promise<FaissStore> {
    console.log("📖 Loading text document...");
    const loader = new TextLoader(path.join(__dirname, "microwave_manual.txt"));
    const documents = await loader.load();

    console.log("✂️ Splitting document into chunks...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 50,
      separators: ["\n\n", "\n", "."],
    });
    const chunks = await textSplitter.splitDocuments(documents);
    console.log(`✅ Created ${chunks.length} chunks`);

    console.log("🔍 Creating embeddings and FAISS index...");
    const vectorStore = await FaissStore.fromDocuments(chunks, this.embeddings);
    await vectorStore.save(path.join(__dirname, "microwave_faiss_index"));
    console.log("💾 Index saved for future use");

    return vectorStore;
  }

  /**
   * Search the vector store for the most relevant chunks for a given query.
   *
   * @param query - The user's question.
   * @param k     - Maximum number of chunks to retrieve. Try different values to
   *                see how context quality changes.
   * @param scoreThreshold - Maximum L2 distance to accept (lower = more similar).
   *                         Increase this to be more permissive; decrease to be
   *                         stricter. Note: FaissStore returns raw L2 distances,
   *                         not normalised 0–1 relevance scores.
   * @returns All retrieved chunks joined by `"\n\n"` as a single context string.
   *
   * @todo Experiment with `k` and `scoreThreshold` to observe how retrieval
   *       quality and answer accuracy change.
   */
  async retrieveContext(query: string, k = 4, scoreThreshold = 1.0): Promise<string> {
    console.log("=".repeat(100));
    console.log("\n🔍 STEP 1: RETRIEVAL\n");
    console.log("-".repeat(100));
    console.log(`Query: '${query}'`);
    console.log(`Searching for top ${k} most relevant chunks (L2 distance ≤ ${scoreThreshold}):`);

    // Returns [Document, l2Distance][] — lower distance means more similar
    const results = await this.vectorStore.similaritySearchWithScore(query, k);

    // Filter by distance threshold, then extract page content
    const contextParts = results
      .filter(([, score]) => score <= scoreThreshold)
      .map(([doc, score]) => {
        console.log(`\n--- (L2 Distance: ${score.toFixed(4)}) ---`);
        console.log(`Content: ${doc.pageContent}`);
        return doc.pageContent;
      });

    console.log("=".repeat(100));
    return contextParts.join("\n\n");
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

    const augmentedPrompt = getUserPrompt(context, query);

    console.log(augmentedPrompt);
    console.log("=".repeat(100));

    return augmentedPrompt;
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

    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(augmentedPrompt),
    ];

    const response = await this.llmClient.invoke(messages);

    console.log(response.content);
    console.log("=".repeat(100));

    return response.content.toString();
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

    // Step 1: Retrieval — play with `k` and `scoreThreshold` to tune results
    const context = await rag.retrieveContext(input);
    // Step 2: Augmentation
    const augmentedPrompt = rag.augmentPrompt(context, input);
    // Step 3: Generation
    await rag.generateAnswer(augmentedPrompt);
  }
};

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: OPENAI_API_KEY,
});

const llmClient = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  apiKey: OPENAI_API_KEY,
});

(async () => {
  const rag = new MicrowaveRAG(embeddings, llmClient);
  await rag.ready; // wait for the vector store to initialise before starting the loop
  await main(rag);
})();
