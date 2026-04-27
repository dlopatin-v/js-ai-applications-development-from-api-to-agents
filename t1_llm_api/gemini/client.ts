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
    this.client = new GoogleGenAI({
      apiKey: this.apiKey
    });
  }

  client: GoogleGenAI;

  /**
   * Convert Message objects to Gemini Content format.
   *
   * @param messages The conversation messages to convert.
   * @returns Messages in Gemini's Content format.
   */
  private convertToGeminiContent = (messages: Message[]): Content[] => {
    return messages.map((message): Content => ({
      role: message.role,
      parts: [{text: message.content}],
    }))
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
  response = async (messages: Message[]): Promise<Message> => {
    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: this.convertToGeminiContent(messages),
      config: {
        systemInstruction: this.systemPrompt,
        maxOutputTokens: 1024
      }
    });

    console.log(response.text);

    return new Message(Role.ASSISTANT, response.text || "");
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
  streamResponse = async (messages: Message[]): Promise<Message> => {
    const response = await this.client.models.generateContentStream({
      model: this.modelName,
      contents: this.convertToGeminiContent(messages),
      config: {
        systemInstruction: this.systemPrompt,
        maxOutputTokens: 1024
      }
    });
    let responseText = "";
    for await (const chunk of response) {
      process.stdout.write(chunk.text || "");
      responseText += chunk.text || "";
    }

    console.log();
    return new Message(Role.ASSISTANT, responseText);
  };
}