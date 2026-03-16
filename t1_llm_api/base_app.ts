import readline from "node:readline/promises";
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
  // - Create a Conversation instance
  // - Set up a readline interface for user input
  // - Loop until user types 'exit':
  //     - Prompt the user for input
  //     - Add a USER Message to the conversation
  //     - Call client.streamResponse or client.response based on `stream`
  //     - Add the AI response Message to the conversation
  throw new Error("Not implemented.");
}