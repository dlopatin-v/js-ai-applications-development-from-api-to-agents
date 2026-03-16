import readline from "node:readline/promises";
import { Conversation, Message, Role } from "../commons";
import AIClient from "./_clients/base_client";


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
 * @param printRequest @TODO
 * @param printOnlyContent @TODO
 * @param client The AI client instance to use for generating responses.
 */
export async function run(client: AIClient, printRequest: boolean, printOnlyContent: boolean) {
  const conversation = new Conversation();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Type your question or 'exit' to quit.")

  while (true) {

    const input = await rl.question(`➡️. `);

    if (input === "exit") {
      console.log("Exiting the chat. Goodbye!");
      rl.close();
      process.exit(0);
    }

    conversation.addMessage(new Message(Role.USER, input));

    console.log("🤖: ");

    const aiMessage = client.response(conversation.messages, printRequest, printOnlyContent);
    conversation.addMessage(aiMessage);
  }
}