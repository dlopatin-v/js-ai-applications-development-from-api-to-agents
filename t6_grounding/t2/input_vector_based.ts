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

    private async initialize(): Promise<void> {
        // TODO: Fetch all users with userService.getAllUsers().
        // Format each user into a Document using formatUserDocument().
        // Build this.vectorStore via createVectorStoreWithBatching().
        throw new Error("Not implemented");
    }

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

    async generateAnswer(augmentedPrompt: string): Promise<string> {
        // TODO: Call llmClient.chat.completions.create() with SYSTEM_PROMPT and augmentedPrompt.
        // Model: gpt-4.1-mini, temperature 0.
        // Return the response content.
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
        const userRequest = await rl.question("➡️ ");

        if (userRequest === "exit") {
            console.log("👋 Goodbye");
            rl.close();
            process.exit(0);
        }

        console.log("\n--- Retrieving context ---");
        const context = await rag.retrieveContext(userRequest);

        if (context) {
            console.log("\n--- Augmenting prompt ---");
            const augmentedPrompt = rag.augmentPrompt(userRequest, context);

            console.log("\n--- Generating answer ---");
            const answer = await rag.generateAnswer(augmentedPrompt);
            console.log(`\nAnswer: ${answer}\n`);
        } else {
            console.log("\n--- No relevant information found ---");
        }
    }
}

main();
