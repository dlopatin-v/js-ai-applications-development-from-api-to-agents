import {
  Conversation,
  Message,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETIONS_ENDPOINT,
  OPENAI_EMBEDDINGS_ENDPOINT, Role
} from "../commons";
import { ChatCompletionClient } from "./chat/chat_completion_client";
import { EmbeddingsClient } from "./embeddings/embeddings_client";
import { SearchMode, TextProcessor } from "./embeddings/text_processor";
import * as readline from "node:readline/promises";

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

const getUserPrompt = (context: string, query: string) => (`##RAG CONTEXT:
${context}


##USER QUESTION: 
${query}
`);

// TODO:
//  Initialize EmbeddingsClient with:
//  - endpoint: OPENAI_EMBEDDINGS_ENDPOINT
//  - modelName: 'text-embedding-3-small'
//  - apiKey: OPENAI_API_KEY
const embeddingClient = new EmbeddingsClient(
  OPENAI_EMBEDDINGS_ENDPOINT,
  'text-embedding-3-small',
  OPENAI_API_KEY
);

// TODO:
//  Initialize ChatCompletionClient with:
//  - endpoint: OPENAI_CHAT_COMPLETIONS_ENDPOINT
//  - modelName: 'gpt-5.2'
//  - apiKey: OPENAI_API_KEY
const completionClient = new ChatCompletionClient(
  OPENAI_CHAT_COMPLETIONS_ENDPOINT,
  'gpt-5.2',
  OPENAI_API_KEY
);

const textProcessor = new TextProcessor(embeddingClient, {
  'host': 'localhost',
  'port': 5433,
  'database': 'vectordb',
  'user': 'postgres',
  'password': 'postgres'
});

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("🎯 Microwave RAG Assistant");
  console.log("=".repeat(100));
  const input = await rl.question(`Load context to VectorDB (y/n)? > `);
  if (['y', 'yes'].indexOf(input.toLowerCase().trim()) != -1) {
    // TODO:
    //  Process the text file with `textProcessor.processTextFile()`:
    //  - filePath: 'microwave_manual.txt'  (relative to embeddings/ directory)
    //  - chunkSize: 400 (experiment: try 150 or 300)
    //  - overlap: 40 (chars overlap from previous chunk)
    //  - dimensions: 384
    console.log("=".repeat(100));
  }

  const conversation = new Conversation();
  conversation.addMessage(new Message(Role.SYSTEM, SYSTEM_PROMPT));

  while (true) {
    const userRequest = await rl.question(`➡️ `);

    if (userRequest === "exit") {
      console.log("👋 Goodbye");
      rl.close();
      process.exit(0);
    }

    // Step 1: Retrieval
    console.log("=".repeat(100));
    console.log("🔍 STEP 1: RETRIEVAL");
    console.log("-".repeat(100));
    // TODO:
    //  Get `context` via `textProcessor.search()`:
    //  - searchMode: SearchMode.EUCLIDIAN_DISTANCE (or COSINE_DISTANCE — experiment!)
    //  - userRequest: userRequest
    //  - topK: 5 (limit of searched results in VectorDB; experiment with different numbers)
    //  - scoreThreshold: 0.01 (experiment: 0.1 → 0.99)
    //  - dimensions: 384
    const context = null;

    // Step 2: Augmentation
    console.log("=".repeat(100));
    console.log("🔗 STEP 2: AUGMENTATION");
    console.log("-".repeat(100));
    // TODO:
    //  1. Build the augmented prompt via `getUserPrompt(context.join(" "), userRequest)`
    //       → assign to `augmentedPrompt`
    //  2. Add a User message with the augmented content to `conversation`
    const augmentedPrompt = null;

    console.log(`Prompt: ${augmentedPrompt}`);

    // Step 3: Generation
    console.log("=".repeat(100));
    console.log("🤖 STEP 3: GENERATION");
    console.log("-".repeat(100));
    // TODO:
    //  1. Call `completionClient.getCompletion(conversation.messages)` → assign to `aiMessage`
    //  2. Add `aiMessage` to `conversation`
    const aiMessage = null;

    console.log("✅ RESPONSE");
    console.log(aiMessage.content);
    console.log("=".repeat(100));
  }
}

// TODO:
//  PAY ATTENTION THAT YOU NEED TO RUN Postgres DB ON PORT 5433 WITH PGVECTOR EXTENSION!
//  RUN docker-compose.yml
//  Optional: Try changing the `dimensions` parameter and observe the effect on search scores.
//            (Change it in init.sql AND in the chunk generation + retrieval steps.)

main();
