import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";
import { OPENAI_API_KEY, Role, UserInfo } from "commons";
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
        console.log("🔎 Loading all users...");
        const users: UserInfo[] = await this.userService.getAllUsers();

        console.log(`Formatting ${users.length} user documents...`);
        const documents = users.map(user =>
            new Document({ pageContent: formatUserDocument(user) })
        );

        console.log(`↗️ Creating embeddings and vectorstore for ${documents.length} documents...`);
        this.vectorStore = await this.createVectorStoreWithBatching(documents);
        console.log("✅ Vectorstore is ready.");
    }

    private async createVectorStoreWithBatching(
        documents: Document[],
        batchSize: number = 100
    ): Promise<FaissStore> {
        const batches = chunkArray(documents, batchSize);

        const batchStores = await Promise.all(
            batches.map(batch => FaissStore.fromDocuments(batch, this.embeddings))
        );

        const [baseStore, ...remainingStores] = batchStores;
        for (const store of remainingStores) {
            baseStore.mergeFrom(store);
        }
        return baseStore;
    }

    async retrieveContext(
        query: string,
        k: number = 10,
        scoreThreshold: number = 1.0
    ): Promise<string> {
        console.log("Retrieving context...");
        const results = await this.vectorStore.similaritySearchWithScore(query, k);

        // Note: both Python and JS use IndexFlatL2 internally, but the Python course code calls
        // similarity_search_with_relevance_scores(), which normalises via (1.0 - distance / sqrt(2))
        // to a 0–1 range where HIGHER = more similar.
        // LangChain JS similaritySearchWithScore() returns the RAW L2 distance with NO normalisation —
        // LOWER = more similar, value is unbounded above.
        // scoreThreshold here acts as a MAXIMUM distance filter (opposite of Python's score_threshold).
        const contextParts: string[] = [];
        for (const [doc, distance] of results) {
            if (distance <= scoreThreshold) {
                contextParts.push(doc.pageContent);
                console.log(`Retrieved (Distance: ${distance.toFixed(3)}): ${doc.pageContent}`);
            }
        }
        console.log("=".repeat(100) + "\n");

        return contextParts.join("\n\n");
    }

    augmentPrompt(query: string, context: string): string {
        return getUserPrompt(context, query);
    }

    async generateAnswer(augmentedPrompt: string): Promise<string> {
        const messages = [
            { role: Role.SYSTEM, content: SYSTEM_PROMPT },
            { role: Role.USER, content: augmentedPrompt },
        ];
        const response = await this.llmClient.chat.completions.create({
            model: "gpt-4.1-mini",
            temperature: 0,
            messages: messages as OpenAI.ChatCompletionMessageParam[],
        });
        return response.choices[0].message.content ?? "";
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

// The problems with vector-based grounding:
//   - Users are loaded once at startup; new/deleted users (every ~5 min) require a full rebuild.
//   - top_k hard cap — if more than k users are relevant the rest are silently dropped.
//   - Semantic search can struggle with highly specific attribute queries (e.g. exact email lookup).
//   - Building 1000 embeddings costs API credits; the store is not persisted between runs.
//
// Benefits of vector-based grounding over no-grounding (t1) and API-based (t2a):
//   - Semantic similarity: finds users by hobbies, personality, or free-text about_me — not just name/email.
//   - Any natural-language input works as a search query.
//   - Far fewer tokens consumed per query compared to loading all users into context.
