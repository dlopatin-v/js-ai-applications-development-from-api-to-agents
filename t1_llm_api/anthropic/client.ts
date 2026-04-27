import Anthropic from "@anthropic-ai/sdk";
import { MessageParam } from "@anthropic-ai/sdk/resources";

import AIClient from "../base_client";

import { Message, Role } from "../../commons";

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
    //TODO:
    // https://github.com/anthropics/anthropic-sdk-typescript (In readme you can find samples with Anthropic client)
    // 1. Initialize Anthropic client: `this.client = new Anthropic({ apiKey: this.apiKey })`
    throw new Error("Not implemented.");
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
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // 0. Make a request in Postman to see the request and response
    // 1. Call client, use `await this.client.messages.create()` with such params:
    //   - system: this.systemPrompt
    //   - max_tokens: 1024
    //   - model: this.modelName
    //   - messages: messages as MessageParam[]
    // 2. Iterate through response content and if content block type is "text" then concat it
    // 3. console.log(message)
    // 4. Return new Message(Role.ASSISTANT, message)
    throw new Error("Not implemented.");
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
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // 0. Make a request in Postman to see the request and response
    // 1. Call client, use `this.client.messages.stream()` with such params:
    //   - system: this.systemPrompt
    //   - max_tokens: 1024
    //   - model: this.modelName
    //   - messages: messages as MessageParam[]
    //   Chain `.on("text", (text) => { process.stdout.write(text) })` to print each delta
    // 2. Await `stream.finalMessage()` to get the complete message
    // 3. Iterate through content blocks, extract text from type "text" blocks
    // 4. Return new Message(Role.ASSISTANT, message)
    throw new Error("Not implemented.");
  };
}
