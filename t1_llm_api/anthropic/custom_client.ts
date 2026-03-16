import { Message, Role } from "../../commons";
import AIClient from "../base_client";

/**
 * Custom HTTP client for Anthropic's Claude API.
 *
 * This implementation uses raw HTTP requests instead of the official SDK,
 * demonstrating how to interact with Claude's API directly
 * and handle its Server-Sent Events (SSE) streaming format.
 */
export class CustomAnthropicAIClient extends AIClient {

  /**
   * Get a synchronous response using a raw HTTP POST request.
   *
   * @param messages The conversation history.
   * @returns The AI's response message.
   *
   * Note: Requires 'x-api-key' header and 'anthropic-version' header.
   * Claude's API returns content as an array of content blocks.
   * The response is printed to stdout before being returned.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://docs.anthropic.com/en/api/messages-examples
    // - Prepare headers with x-api-key, anthropic-version, and content type
    // - Build request body with system prompt, messages, and max_tokens
    // - Execute POST request to the API (use fetch)
    // - Parse the response (content blocks)
    // - Print the response to console
    // - Return an ASSISTANT Message
    throw new Error("Not implemented.");
  }

  /**
   * Get a streaming response using raw HTTP with Server-Sent Events (SSE).
   *
   * The response is streamed using Anthropic's SSE format, with text deltas
   * printed immediately as they arrive.
   *
   * @param messages The conversation history.
   * @returns The complete AI response message after all deltas are received.
   *
   * Note: Uses Server-Sent Events (SSE) format where each line starts with "data: ".
   * Listens for 'content_block_delta' events with 'text_delta' type.
   * Stops processing when 'message_stop' event is received.
   * Each delta is printed to stdout as it arrives.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://docs.anthropic.com/en/docs/build-with-claude/streaming
    // - Prepare headers with x-api-key, anthropic-version, and content type
    // - Build request body with system prompt, messages, max_tokens, and stream: true
    // - Execute POST request to the API (use fetch)
    // - Read the SSE stream: parse "data: " lines for 'content_block_delta' events
    // - Write text deltas to stdout
    // - Break out of the loop on 'message_stop' event
    // - Return the assembled ASSISTANT Message
    throw new Error("Not implemented.");
  }
}
