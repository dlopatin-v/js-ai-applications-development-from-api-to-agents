import { GoogleGenAI, Content } from "@google/genai";
import { Message, Role } from "../../commons";
import AIClient from "../base_client";

/**
 * Client for Google Gemini API using the official SDK.
 *
 * This implementation uses the official Google GenAI TypeScript library to interact
 * with Gemini models, providing both synchronous and streaming response capabilities.
 *
 * Inherits all attributes from AIClient.
 */
export class GeminiAICLient extends AIClient {
  client: GoogleGenAI;

  /**
   * Initialize the Gemini client with the official SDK.
   *
   * @param args Constructor parameters inherited from AIClient (endpoint, modelName, apiKey, systemPrompt).
   */
  constructor(...args: ConstructorParameters<typeof AIClient>) {
    super(...args);
    //TODO:
    // - Initialize the Google GenAI SDK client https://ai.google.dev/gemini-api/docs/text-generation#javascript
    throw new Error("Not implemented.");
  }

  /**
   * Get a synchronous response from Google's Gemini API.
   *
   * @param messages The conversation history.
   * @returns The AI's response message.
   *
   * Note: Gemini uses 'systemInstruction' parameter for system-level guidance.
   * The response is printed to stdout before being returned.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Convert messages to Gemini Content format using this.convertToGeminiContent(messages)
    // - Call the SDK client (use systemInstruction for system prompt)
    // - Print the response to console
    // - Return an ASSISTANT Message
    throw new Error("Not implemented.");
  };

  /**
   * Get a streaming response from Google's Gemini API.
   *
   * The response is streamed chunk-by-chunk, with each text chunk printed
   * immediately as it arrives.
   *
   * @param messages The conversation history.
   * @returns The complete AI response message after all chunks are received.
   *
   * Note: Uses the async streaming interface provided by the Gemini SDK.
   * Each chunk's text is printed to stdout as it arrives.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Convert messages to Gemini Content format using this.convertToGeminiContent(messages)
    // - Call the SDK client with streaming (use systemInstruction for system prompt)
    // - Iterate over stream chunks and write to stdout
    // - Return the assembled ASSISTANT Message
    throw new Error("Not implemented.");
  };

  /**
   * Convert Message objects to Gemini Content format.
   *
   * @param messages The conversation messages to convert.
   * @returns Messages in Gemini's Content format.
   */
  private convertToGeminiContent = (messages: Array<Message>): Content[] => {
    //TODO:
    // - Map each message to a Content object with role and parts
    throw new Error("Not implemented.");
  };
}
