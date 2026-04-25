import * as readline from "node:readline/promises";

import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { OPENAI_API_KEY, Role, UserInfo } from "commons";
import { UserServiceClient } from "../user_service_client";

/*
 HOBBIES SEARCHER:
 Searches users by hobbies and provides their full info in JSON format:
 Input: I need to gather people that love to go to mountains
 Output:
    rock climbing: [{full user info JSON},...],
    hiking: [{full user info JSON},...],
    camping: [{full user info JSON},...]
*/

const SYSTEM_PROMPT = `You are a RAG-powered assistant that groups users by their hobbies.

## Flow:
Step 1: User will ask to search users by their hobbies etc.
Step 2: Will be performed search in the Vector store to find most relevant users.
Step 3: You will be provided with CONTEXT (most relevant users, there will be user ID and information about user), and 
        with USER QUESTION.
Step 4: You group by hobby users that have such hobby and return response according to Response Format

`;

const USER_PROMPT = `## CONTEXT:
{context}

## USER QUESTION: 
{query}`;

const getUserPrompt = (context: string, query: string) =>
  USER_PROMPT.replace("{context}", context).replace("{query}", query);

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });

const GroupingResultSchema = z.object({
  hobby: z.string().describe("Hobby. Example: football, painting, horsing, photography, bird watching..."),
  userIds: z.array(z.number().int()).describe("List of user IDs that have hobby requested by user."),
});

const GroupingResultsSchema = z.object({
  groupingResults: z.array(GroupingResultSchema).describe("List matching search results."),
});

type GroupingResult = z.infer<typeof GroupingResultSchema>;
type GroupingResults = z.infer<typeof GroupingResultsSchema>;

// ---

function formatUserDocument(user: UserInfo): string {
  return `User:\n id: ${user["id"]},\nAbout user: ${user["about_me"]}\n`;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

class InputGrounder {
  private vectorStore!: Chroma;
  private llmClient: OpenAI;
  private userService: UserServiceClient;

  readonly ready: Promise<void>;

  constructor(private embeddings: OpenAIEmbeddings, llmClient: OpenAI) {
    this.llmClient = llmClient;
    this.userService = new UserServiceClient();
    this.ready = this.initializeVectorstore();
  }

  private async initializeVectorstore(): Promise<void> {
    console.log("🔍 Loading all users for initial vectorstore...");
    const users = await this.userService.getAllUsers();
    const documents = users.map((user: UserInfo) => new Document({ pageContent: formatUserDocument(user), metadata: { user_id: user.id } }));

    console.log("setup vectorstore...");
    this.vectorStore = await Chroma.fromDocuments(documents, this.embeddings, { collectionName: "users" });

    console.log("Setup FINISHED");
  }

  private async updateVectorstore(): Promise<void> {
    const users = await this.userService.getAllUsers();

    const collection = await this.vectorStore.ensureCollection();
    const vectorData = await collection.get({ include: ["metadatas"] });
    const vectorstoreIdsSet = new Set<string>(vectorData.ids.map(String));

    // Build a lookup map from the fresh user list
    const usersDict: Record<string, UserInfo> = {};
    for (const user of users) {
      usersDict[String(user["id"])] = user;
    }
    const usersIdsSet = new Set<string>(Object.keys(usersDict));

    // Set diff: what's new vs what's gone
    const newUserIds = [...usersIdsSet].filter(id => !vectorstoreIdsSet.has(id));
    const idsToDelete = [...vectorstoreIdsSet].filter(id => !usersIdsSet.has(id));

    const newDocuments = newUserIds.map(userId =>
      new Document({ pageContent: formatUserDocument(usersDict[userId]), metadata: { user_id: userId } })
    );

    if (idsToDelete.length > 0) {
      await this.vectorStore.delete({ ids: idsToDelete });
    }

    if (newDocuments.length > 0) {
      if (newDocuments.length > 50) {
        const batches = chunkArray(newDocuments, 50);
        await Promise.all(batches.map(batch => this.vectorStore.addDocuments(batch)));
      } else {
        await this.vectorStore.addDocuments(newDocuments);
      }
    }
  }

  async retrieveContext(query: string, k: number = 100, score: number = 0.2): Promise<string> {
    if (!this.vectorStore) {
      await this.initializeVectorstore();
    } else {
      await this.updateVectorstore();
    }

    console.log("Retrieving context...");
    const results = await this.vectorStore.similaritySearchWithScore(query, k);
    // Note: Chroma JS returns raw distances (lower = more similar).
    // Python's similarity_search_with_relevance_scores normalises to 0–1 (higher = more similar,
    // score_threshold filters OUT docs BELOW threshold).
    // Here `score` acts as a MAXIMUM distance — docs with distance > score are excluded.
    const contextParts: string[] = [];
    for (const [doc, distance] of results) {
      if (distance <= score) {
        contextParts.push(doc.pageContent);
        console.log(`Retrieved (Score: ${distance.toFixed(3)}): ${doc.pageContent}`);
      }
    }
    console.log("=".repeat(100) + "\n");
    return contextParts.join("\n\n");

  }

  augmentPrompt(query: string, context: string): string {
    return getUserPrompt(context, query);
  }

  async generateAnswer(augmentedPrompt: string): Promise<GroupingResults> {
    const messages = [
      { role: Role.SYSTEM, content: SYSTEM_PROMPT },
      { role: Role.USER, content: augmentedPrompt },
    ];

    const response = await this.llmClient.chat.completions.parse({
      model: "gpt-4.1-nano",
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      temperature: 0,
      response_format: zodResponseFormat(GroupingResultsSchema, 'groupingResults'),
    });

    return response.choices[0].message.parsed as GroupingResults;
  }
}

class OutputGrounder {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  async groundResponse(groupingResults: GroupingResults): Promise<void> {
    const userIds = groupingResults.groupingResults.flatMap(result => result.userIds);
    const usersInfo = await this._findUsers(userIds);

    console.log(`Hobby: ${groupingResults.groupingResults[0].hobby}`);
    console.log(`Users: ${JSON.stringify(usersInfo)}`);
    console.log("----------");
  }

  private async _findUsers(ids: number[]): Promise<Record<string, any>[]> {
    const safeGetUser = async (userId: number): Promise<Record<string, any> | null> => {
      try {
        return await this.userService.getUser(userId);
      } catch (e: unknown) {
        if (String(e).includes("404")) {
          console.log(`User with ID ${userId} is absent (404)`);
          return null;
        }
        throw e; // re-raise non-404 errors
      }
    };

    const results = await Promise.all(ids.map(safeGetUser));
    return results.filter((user): user is Record<string, any> => user !== null);
  }
}

async function main() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: OPENAI_API_KEY,
    dimensions: 384,
  });

  const outputGrounder = new OutputGrounder();
  const inputGrounder = new InputGrounder(embeddings, llmClient);
  await inputGrounder.ready;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Query samples:");
  console.log(" - I need people who love to go to mountains");
  console.log(" - Find people who love to watch stars and night sky");
  console.log(" - I need people to go to fishing together");

  while (true) {
    const userQuestion = await rl.question("> ");

    if (userQuestion.toLowerCase() === "exit") {
      console.log("👋 Goodbye");
      rl.close();
      process.exit(0);
    }

    const context = await inputGrounder.retrieveContext(userQuestion);
    const augmentedPrompt = inputGrounder.augmentPrompt(userQuestion, context);
    const groupingResults = await inputGrounder.generateAnswer(augmentedPrompt);
    await outputGrounder.groundResponse(groupingResults);
  }
}

main();
