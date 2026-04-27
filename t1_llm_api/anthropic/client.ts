import Anthropic from "@anthropic-ai/sdk";

import { Message, Role } from "../../commons";
import AIClient from "../base_client";

/**
 * Client for Anthropic's Claude API using the official SDK.
 *
 * This implementation uses the official Anthropic TypeScript library to interact
 * with Claude models, providing both synchronous and streaming response capabilities.
 *
 * Inherits all attributes from AIClient.
 */
export class AnthropicAIClient extends AIClient {
  /**
   * Initialize the Anthropic client with the official SDK.
   *
   * @param args Constructor parameters inherited from AIClient (endpoint, modelName, systemPrompt, apiKey).
   */
  constructor(...args: ConstructorParameters<typeof AIClient>) {
    super(...args);
    this.client = new Anthropic({
      apiKey: this.apiKey
    });
  }

  client: Anthropic;

  /**
   * Get a synchronous response from Anthropic's Claude API.
   *
   * @param messages The conversation history.
   * @returns The AI's response message.
   *
   * Note: Claude's API uses a separate 'system' parameter for system instructions.
   * Response content blocks are concatenated into a single text response.
   * The response is printed to stdout before being returned.
   */
  response = async (messages: Message[]): Promise<Message> => {
    const {content} = await this.client.messages.create({
      max_tokens: 1024,
      model: this.modelName,
      system: this.systemPrompt,
      messages: messages as Anthropic.MessageParam[],
    });

    let message = "";

    if (content[0].type === "text") {
      message = content[0].text;
    }
    console.log(message);

    return new Message(Role.ASSISTANT, message);
  };

  /**
   * Get a streaming response from Anthropic's Claude API.
   *
   * The response is streamed using event-based streaming, with text deltas
   * printed immediately as they arrive.
   *
   * @param messages The conversation history.
   * @returns The complete AI response message after all deltas are received.
   *
   * Note: Listens for 'text' events with text deltas.
   * Each delta is printed to stdout as it arrives for real-time display.
   */
  streamResponse = async (messages: Message[]): Promise<Message> => {
    const stream = this.client.messages.stream({
      max_tokens: 1024,
      model: this.modelName,
      system: this.systemPrompt,
      messages: messages as Anthropic.MessageParam[],
    }).on("text", (text) => {
      process.stdout.write(text);
    })

    const {content} = await stream.finalMessage();
    let message = "";

    if (content[0].type === "text") {
      message = content[0].text;
    }

    return new Message(Role.ASSISTANT, message);
  };
}