import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import { OPENAI_API_KEY, Role } from "../../commons";
import { UserServiceClient } from "../user_service_client";
import * as readline from "node:readline/promises";

const SYSTEM_PROMPT = `You are a RAG-powered assistant that assists users with their questions about user information.
            
## Structure of User message:
\`RAG CONTEXT\` - Retrieved documents relevant to the query.
\`USER QUESTION\` - The user's actual question.

## Instructions:
- Use information from \`RAG CONTEXT\` as context when answering the \`USER QUESTION\`.
- Cite specific sources when using information from the context.
- Answer ONLY based on conversation history and RAG context.
- If no relevant information exists in \`RAG CONTEXT\` or conversation history, state that you cannot answer the question.
`;

const getUserPrompt = (context: string, query: string) => (`## RAG CONTEXT:
${context}

## USER QUESTION:
${query}`);

function formatUserDocument(user: Record<string, any>): string {
    let contextStr = "User:\n";
    for (const [key, value] of Object.entries(user)) {
        contextStr += `  ${key}: ${value}\n`;
    }
    contextStr += "\n";
    return contextStr;
}

function chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
    );
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

    /**
     * Bootstraps the vector store by fetching all users and embedding them.
     *
     * Called automatically in the constructor via `this.ready`.
     * Fetches all users from the User Service, converts each to a LangChain
     * `Document` using `formatUserDocument`, then builds `this.vectorStore`
     * via `createVectorStoreWithBatching`.
     */
    private async initialize(): Promise<void> {
        // TODO: Fetch all users with userService.getAllUsers().
        // Format each user into a Document using formatUserDocument().
        // Build this.vectorStore via createVectorStoreWithBatching().
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
        // TODO: Split documents into batches of batchSize using chunkArray().
        // Create a FaissStore for each batch with FaissStore.fromDocuments().
        // Merge all stores into the first one with baseStore.mergeFrom().
        // Return the merged FaissStore.
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
        // TODO: Call this.vectorStore.similaritySearchWithScore(query, k).
        // Note: JS returns raw L2 distances (lower = more similar).
        // Filter results where distance <= scoreThreshold.
        // Log each retrieved document with its distance.
        // Return the joined context string.
        throw new Error("Not implemented");
    }

    augmentPrompt(query: string, context: string): string {
        return getUserPrompt(context, query);
    }

    /**
     * Sends the augmented prompt to the LLM and returns the answer.
     *
     * @param augmentedPrompt - The prompt containing RAG context and user question.
     * @returns The assistant's response content string.
     */
    async generateAnswer(augmentedPrompt: string): Promise<string> {
        // TODO: Call llmClient.chat.completions.create() with SYSTEM_PROMPT and augmentedPrompt.
        // Model: gpt-4.1-mini, temperature 0.
        // Return the response content.
        throw new Error("Not implemented");
    }
}

async function main() {
    // TODO:
    // 1. Create OpenAIEmbeddings with:
    //    - model: "text-embedding-3-small"
    //    - apiKey: OPENAI_API_KEY
    //    - dimensions: 384
    // 2. Create UserRAG(embeddings) and await rag.ready
    // 3. Create readline interface with process.stdin / process.stdout
    // 4. Print "Query samples:" and sample queries:
    //    " - I need user emails that filled with hiking and psychology"
    //    " - Who is John?"
    // 5. Start a while(true) loop:
    //   5.1. Read userRequest via rl.question("➡️ ")
    //   5.2. If userRequest === "exit": close rl and process.exit(0)
    //   5.3. Call rag.retrieveContext(userRequest) → context
    //   5.4. Call rag.augmentPrompt(userRequest, context) → augmentedPrompt
    //   5.5. Call rag.generateAnswer(augmentedPrompt) → answer
    //   5.6. Print answer
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
