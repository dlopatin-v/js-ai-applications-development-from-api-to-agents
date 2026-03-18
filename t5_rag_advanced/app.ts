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

// TODO:
//  Create a SYSTEM_PROMPT that:
//  - Identifies the assistant as a RAG-powered microwave assistant
//  - Describes the User message structure (RAG CONTEXT section + USER QUESTION section)
//  - Instructs the LLM to answer only from RAG context and conversation history
//  - Instructs the LLM to decline questions unrelated to microwave usage or outside the context
const SYSTEM_PROMPT = ``;

// TODO:
//  Create a getUserPrompt(context, query) helper that builds the augmented user message,
//  structured with `##RAG CONTEXT:` and `##USER QUESTION:` sections.
const getUserPrompt = (context: string, query: string) => ``;

// TODO:
//  Initialize clients and TextProcessor:
//  - EmbeddingsClient: endpoint=OPENAI_EMBEDDINGS_ENDPOINT, modelName='text-embedding-3-small', apiKey=OPENAI_API_KEY
//  - ChatCompletionClient: endpoint=OPENAI_CHAT_COMPLETIONS_ENDPOINT, modelName='gpt-5.2', apiKey=OPENAI_API_KEY
//  - TextProcessor DB config: host=localhost, port=5433, database=vectordb, user=postgres, password=postgres

async function main() {
  // TODO:
  //  Implement the console chat loop:
  //  1. Ask the user whether to load context into VectorDB (y/n)
  //     - If yes, call textProcessor.processTextFile() with the microwave manual
  //  2. Initialise a Conversation with the SYSTEM_PROMPT
  //  3. Loop:
  //     a. Read user input (exit on "exit")
  //     b. Step 1 — Retrieval: call textProcessor.search() to get relevant context chunks
  //     c. Step 2 — Augmentation: build the augmented prompt and add it to the conversation
  //     d. Step 3 — Generation: call completionClient.getCompletion() and add the reply to the conversation
}

// TODO:
//  PAY ATTENTION THAT YOU NEED TO RUN Postgres DB ON PORT 5433 WITH PGVECTOR EXTENSION!
//  RUN docker-compose.yml

main();
