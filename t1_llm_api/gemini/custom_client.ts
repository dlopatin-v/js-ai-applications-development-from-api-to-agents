import AIClient from "../base_client";

import { Message, Role } from "../../commons";

/**
 * Custom HTTP client for Google Gemini API.
 *
 * This implementation uses raw fetch requests instead of the official SDK,
 * demonstrating how to interact with Gemini's API directly and handle its
 * Server-Sent Events (SSE) streaming format.
 */
export class CustomGeminiAIClient extends AIClient {

  /**
   * Sends a non-streaming request using a raw HTTP POST to the Gemini API.
   *
   * The URL is constructed by appending `:generateContent` to the model endpoint.
   * Uses `x-goog-api-key` header for authentication.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://ai.google.dev/gemini-api/docs/text-generation
    // - Prepare headers with api key and content type
    // - Convert messages using this._toGeminiContents(messages)
    // - Add System prompt
    // - Execute post request to AI API (use `fetch`)
    // - Parse response
    // - Print response to console
    // - Return ASSISTANT message
    throw new Error("Not implemented.");
  }

  /**
   * Sends a streaming request using raw HTTP with Server-Sent Events (SSE).
   *
   * The URL is constructed with the `:streamGenerateContent?alt=sse` endpoint.
   * Each SSE chunk contains candidates with content parts that are written to
   * stdout immediately as they arrive.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://ai.google.dev/gemini-api/docs/text-generation
    // - Prepare headers with api key and content type
    // - Convert messages using this._toGeminiContents(messages)
    // - Add System prompt
    // - Execute post request to AI API (use `fetch`)
    // - Handle stream with chunks
    // - Parse response
    // - Print chunks to console
    // - Return ASSISTANT message
    throw new Error("Not implemented.");
  }

  /**
   * Converts Message objects to Gemini's content dictionary format.
   *
   * @param messages Conversation messages to convert.
   * @returns Messages formatted as Gemini content objects.
   */
  private _toGeminiContents = (messages: Array<Message>): Array<{role: string, parts: Array<{text: string}> }> => {
    //TODO:
    // - Map each message to an object with role and parts: [{text: message.content}]
    throw new Error("Not implemented.");
  }
}
