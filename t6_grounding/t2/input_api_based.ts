import * as readline from "node:readline/promises";

import { OpenAI } from "openai";
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";

import { OPENAI_API_KEY, Role, UserInfo, UserSearchRequest } from "../../commons/index.js";
import { UserServiceClient } from "../user_service_client";

const QUERY_ANALYSIS_PROMPT = `You are a query analysis system that extracts search parameters from user questions about users.

## Available Search Fields:
- **name**: User's first name (e.g., "John", "Mary")
- **surname**: User's last name (e.g., "Smith", "Johnson") 
- **email**: User's email address (e.g., "john@example.com")

## Instructions:
1. Analyze the user's question and identify what they're looking for
2. Extract specific search values mentioned in the query
3. Map them to the appropriate search fields
4. If multiple search criteria are mentioned, include all of them
5. Only extract explicit values - don't infer or assume values not mentioned

## Examples:
- "Who is John?" → name: "John"
- "Find users with surname Smith" → surname: "Smith" 
- "Look for john@example.com" → email: "john@example.com"
- "Find John Smith" → name: "John", surname: "Smith"
- "I need user emails that filled with hiking" → No clear search parameters (return empty list)`;

const SYSTEM_PROMPT = `You are a RAG-powered assistant that assists users with their questions about user information.
            
## Structure of User message:
\`RAG CONTEXT\` - Retrieved documents relevant to the query.
\`USER QUESTION\` - The user's actual question.

## Instructions:
- Use information from \`RAG CONTEXT\` as context when answering the \`USER QUESTION\`.
- Cite specific sources when using information from the context.
- Answer ONLY based on conversation history and RAG context.
- If no relevant information exists in \`RAG CONTEXT\` or conversation history, state that you cannot answer the question.
- Be conversational and helpful in your responses.
- When presenting user information, format it clearly and include relevant details.`;

const getUserPrompt = (context: string, query: string) => (`## RAG CONTEXT:
${context}

## USER QUESTION:
${query}`);

const SearchField = z.enum(["name", "surname", "email"]);
const SearchRequest = z.object({
  searchField: SearchField,
  searchVale: z.string()
})
const SearchRequests = z.object({
  searchRequestParams: z.array(SearchRequest)
});

const llmClient = new OpenAI({ apiKey: OPENAI_API_KEY });
const userService = new UserServiceClient();


async function retrieveContext(userRequest: string): Promise<UserInfo[]> {
  const messages = [
    { role: Role.SYSTEM, content: QUERY_ANALYSIS_PROMPT },
    { role: Role.USER, content: userRequest },
  ];

  const response = await llmClient.chat.completions.parse({
    model: 'gpt-4.1-nano',
    temperature: 0,
    messages: messages as OpenAI.ChatCompletionMessageParam[],
    response_format: zodResponseFormat(SearchRequests, 'searchRequests')
  });

  const searchRequests = response.choices[0].message.parsed;
  const searchRequestParams = searchRequests?.searchRequestParams;

  if (searchRequestParams) {
    const transformedRequest = searchRequestParams.reduce((acc: UserSearchRequest, param) => {
      acc[param.searchField] = param.searchVale;
      return acc;
    }, {} as UserSearchRequest);
    return await userService.searchUsers(transformedRequest);
  }

  return [];
}

async function augmentPrompt(userRequest: string, context: UserInfo[]): Promise<string> {
  const contextStr = context.map(user => {
    const userDetails = Object.entries(user)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join('\n');
    return `User:\n${userDetails}\n`;
  })
    .join('');

  const augmentedPrompt = getUserPrompt(contextStr, userRequest);
  console.log(augmentedPrompt);
  return augmentedPrompt;
}

async function generateAnswer(augmentedPrompt: string): Promise<string | null> {
  const messages = [
    { role: Role.SYSTEM, content: SYSTEM_PROMPT },
    { role: Role.USER, content: augmentedPrompt },
  ]
  const response = await llmClient.chat.completions.create({
    model: "gpt-4.1-mini", temperature: 0, messages: messages as OpenAI.ChatCompletionMessageParam[]
  });
  return response.choices[0].message.content;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  console.log("Query samples:");
  console.log(" - I need user emails that filled with hiking and psychology");
  console.log(" - Who is John?");
  console.log(" - Find users with surname Adams");
  console.log(" - Do we have smbd with name John that love painting?");

  while (true) {
    const userRequest = await rl.question(`➡️ `);

    if (userRequest === "exit") {
      console.log("👋 Goodbye");
      rl.close();
      process.exit(0);
    }

    console.log("\n--- Retrieving context ---")
    const context = await retrieveContext(userRequest)
    if (context) {
      console.log("\n--- Augmenting prompt ---")
      const augmentedPrompt = await augmentPrompt(userRequest, context)

      console.log("\n--- Generating answer ---")
      const answer = await generateAnswer(augmentedPrompt)
      console.log(`\nAnswer: ${answer}\n`);
    } else {
      console.log("\n--- No relevant information found ---")
    }
  }
}

main();
