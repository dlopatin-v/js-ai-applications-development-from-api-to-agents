import {
  Conversation,
  Message,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETIONS_ENDPOINT,
  OPENAI_EMBEDDINGS_ENDPOINT, Role
} from "../commons/index.js";
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

const embeddingClient = new EmbeddingsClient(OPENAI_EMBEDDINGS_ENDPOINT, 'text-embedding-3-small', OPENAI_API_KEY);
const completionClient = new ChatCompletionClient(OPENAI_CHAT_COMPLETIONS_ENDPOINT, 'gpt-5.2', OPENAI_API_KEY);
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
    await textProcessor.processTextFile(
      'microwave_manual.txt',
      400,
      40,
      384
    )
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

    // Step 1: retrieval
    console.log("=".repeat(100));
    console.log("🔍 STEP 1: RETRIEVAL");
    console.log("-".repeat(100));
    const context = await textProcessor.search(
      SearchMode.EUCLIDIAN_DISTANCE,
      userRequest,
      5,
      0.01,
      384
    )

    // Step 2: Augmentation
    console.log("=".repeat(100));
    console.log("🔗 STEP 2: AUGMENTATION");
    console.log("-".repeat(100));
    const augmentedPrompt = getUserPrompt(context.join(" "), userRequest);
    conversation.addMessage(new Message(Role.USER, augmentedPrompt));

    console.log(`Prompt: ${augmentedPrompt}`);

    // Step 3: Generation
    console.log("=".repeat(100));
    console.log("🤖 STEP 3: GENERATION");
    console.log("-".repeat(100));
    const aiMessage = await completionClient.getCompletion(conversation.messages);

    console.log("✅ RESPONSE");
    console.log(aiMessage.content);
    console.log("=".repeat(100));
    conversation.addMessage(aiMessage);
  }
}

main();