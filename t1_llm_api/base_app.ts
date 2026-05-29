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
  // TODO ✓ Create a Conversation instance — хранилище истории диалога.
  // Дженерик <unknown>, потому что в t1 ещё нет tool_calls.
  const conversation = new Conversation<unknown>();

  // TODO ✓ Set up a readline interface for user input — асинхронный stdin/stdout.
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("Chat started. Type 'exit' to quit.\n");

  try {
    // TODO ✓ Loop until user types 'exit'
    while (true) {
      // Запрашиваем ввод пользователя (await — потому что используем readline/promises).
      const userInput = (await rl.question("You: ")).trim();
      if (userInput.toLowerCase() === "exit") break;
      if (!userInput) continue; // пустой ввод просто пропускаем

      // TODO ✓ Add a USER Message to the conversation
      conversation.addMessage(new Message(Role.USER, userInput));

      // TODO ✓ Call client.streamResponse or client.response based on `stream`
      // В streaming-режиме клиент сам печатает токены в stdout по мере прихода,
      // поэтому достаточно вывести префикс "AI: " заранее.
      process.stdout.write("AI: ");
      const aiMessage = stream
        ? await client.streamResponse(conversation.messages)
        : await client.response(conversation.messages);
      process.stdout.write("\n\n");

      // TODO ✓ Add the AI response Message to the conversation
      // На следующей итерации этот ответ уйдёт обратно в LLM как часть контекста.
      conversation.addMessage(aiMessage);
    }
  } finally {
    // Закрываем readline, иначе процесс не завершится — stdin останется открытым.
    rl.close();
  }
}