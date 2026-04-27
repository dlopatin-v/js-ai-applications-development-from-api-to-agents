import { GoogleGenAI, Content } from "@google/genai";

import AIClient from "../base_client";

import { Message, Role } from "../../commons";

/**
 * Client for Google Gemini API using the official SDK.
 *
 * This implementation uses the official Google GenAI TypeScript library to interact
 * with Gemini models, providing both synchronous and streaming response capabilities.
 *
 * Inherits all attributes from AIClient.
 */
export class GeminiAICLient extends AIClient {
  /**
   * Initialize the Gemini client with the official SDK.
   *
   * @param args Constructor parameters inherited from AIClient (endpoint, modelName, systemPrompt, apiKey).
   */
  constructor(...args: ConstructorParameters<typeof AIClient>) {
    super(...args);
    //TODO:
    // https://ai.google.dev/gemini-api/docs/text-generation#javascript
    // 1. Initialize GoogleGenAI client: `this.client = new GoogleGenAI({ apiKey: this.apiKey })`
    throw new Error("Not implemented.");
  }

  client: GoogleGenAI;

  /**
   * Convert Message objects to Gemini Content format.
   *
   * @param messages The conversation messages to convert.
   * @returns Messages in Gemini's Content format.
   */
  private convertToGeminiContent = (messages: Array<Message>): Content[] => {
    //TODO:
    // 1. Initialize empty contents array
    // 2. Iterate through messages:
    //   - get role from message: `const role = message.role`
    //   - push to contents: `{ role, parts: [{ text: message.content }] }`
    // 3. Return contents array
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
    // https://ai.google.dev/gemini-api/docs/text-generation#javascript
    // 0. Make a request in Postman to see the request and response
    // 1. Call client, use `await this.client.models.generateContent()` with such params:
    //   - model: this.modelName
    //   - contents: this.convertToGeminiContent(messages)
    //   - config: { systemInstruction: this.systemPrompt, maxOutputTokens: 1024 }
    // 2. Get content from response: `const content = response.text`
    // 3. console.log(content)
    // 4. Return new Message(Role.ASSISTANT, content || "")
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
    // https://ai.google.dev/gemini-api/docs/text-generation#javascript
    // 0. Make a request in Postman to see the request and response
    // 1. Initialize empty responseText string to collect streamed chunks
    // 2. Call client, use `await this.client.models.generateContentStream()` with such params:
    //   - model: this.modelName
    //   - contents: this.convertToGeminiContent(messages)
    //   - config: { systemInstruction: this.systemPrompt, maxOutputTokens: 1024 }
    // 3. Iterate through chunks in generated stream (for await (const chunk of response)):
    //   - if chunk.text is not empty:
    //       - process.stdout.write(chunk.text || "")
    //       - append chunk.text to responseText
    // 4. Print empty line (console.log())
    // 5. Return new Message(Role.ASSISTANT, responseText)
    throw new Error("Not implemented.");
  };
}
