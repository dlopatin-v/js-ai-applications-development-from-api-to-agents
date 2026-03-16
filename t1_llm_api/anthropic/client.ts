import Anthropic from "@anthropic-ai/sdk";
import { Message, Role } from "../../commons";
import AIClient from "../base_client";
import { MessageParam } from "@anthropic-ai/sdk/resources";

/**
 * Client for Anthropic's Claude API using the official SDK.
 *
 * This implementation uses the official Anthropic TypeScript library to interact
 * with Claude models, providing both synchronous and streaming response capabilities.
 *
 * Inherits all attributes from AIClient.
 */
export class AnthropicAIClient extends AIClient {
  client!: Anthropic;

  /**
   * Initialize the Anthropic client with the official SDK.
   *
   * @param args Constructor parameters inherited from AIClient (endpoint, modelName, apiKey, systemPrompt).
   */
  constructor(...args: ConstructorParameters<typeof AIClient>) {
    super(...args);
    //TODO:
    // - Initialize the Anthropic SDK client https://github.com/anthropics/anthropic-sdk-python?tab=readme-ov-file#usage
    // Useful links with request/response samples:
    //   - https://docs.anthropic.com/en/api/overview
    //   - https://docs.anthropic.com/en/api/messages
    throw new Error("Not implemented.");
  }

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
    // - Call the SDK client (use system parameter for system prompt)
    // - Print the response to console
    // - Return an ASSISTANT Message
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
    // - Call the SDK client with streaming (use system parameter for system prompt)
    // - Listen for text events and write to stdout
    // - Return the assembled ASSISTANT Message
    throw new Error("Not implemented.");
  };
}
