import * as readline from "node:readline/promises";
import { Conversation, Message, Role } from "../commons";
import AIClient from "./base_client";


/**
 * Start an interactive chat session with an AI client.
 *
 * This function runs a continuous loop that:
 * 1. Prompts the user for input
 * 2. Sends the conversation history to the AI
 * 3. Displays the AI's response
 * 4. Maintains conversation context
 *
 * The loop continues until the user types 'exit'.
 *
 * @param stream If true, use streaming responses (real-time token display).
 *               If false, use synchronous responses (complete response at once).
 * @param client The AI client instance to use for generating responses.
 */
export async function start(stream: boolean, client: AIClient) {
  //TODO:
  // Main chat loop that handles user interaction with AI clients.
  // 1. Create a new Conversation object to maintain chat history
  // 2. Create readline interface:
  //   const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  // 3. Print to console: "Type your question or 'exit' to quit."
  // 4. Create infinite `while` loop
  // 5. Get user input from console using `await rl.question('➡️. ')`
  // 6. If user_input is `exit` then print "Exiting the chat. Goodbye!", close rl and call `process.exit(0)`
  // 7. Add user message to conversation (role is Role.USER, content is user_input)
  // 8.1. If `stream` is true then call `client.stream_completion` with messages (it's async, don't forget to await)
  // 8.2. Otherwise call `client.get_completion` with messages
  // 8.3. Get Assistant message and add it to the conversation
  throw new Error("Not implemented.");
}
