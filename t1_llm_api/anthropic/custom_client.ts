import Anthropic from "@anthropic-ai/sdk";
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
    // https://platform.claude.com/docs/en/build-with-claude/working-with-messages
    // 0. Make a request in Postman to see the request and response
    // 1. Prepare headers object with:
    //   - "x-api-key" (this.apiKey)
    //   - "Content-Type" ("application/json")
    //   - "anthropic-version" ("2023-06-01")
    // 2. Prepare request data object:
    //   - "model" (this.modelName)
    //   - "system" (this.systemPrompt)
    //   - "max_tokens" (1024)
    //   - "messages" (messages)
    // 3. Execute fetch POST to this.endpoint with headers, method "POST", body JSON.stringify(requestData)
    // 4.1. If response.status === 200 then:
    //   - get response json as Anthropic.Message
    //   - get content blocks: filter for type "text" and map to text, join with ""
    //   - console.log(message)
    //   - return new Message(Role.ASSISTANT, message)
    // 4.2. Otherwise throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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
    // https://platform.claude.com/docs/en/build-with-claude/streaming
    // 0. Make a request in Postman to see the request and response
    // 1. Prepare headers object with:
    //   - "x-api-key" (this.apiKey)
    //   - "Content-Type" ("application/json")
    //   - "anthropic-version" ("2023-06-01")
    // 2. Prepare request data object:
    //   - "model" (this.modelName)
    //   - "system" (this.systemPrompt)
    //   - "max_tokens" (1024)
    //   - "stream" (true)
    //   - "messages" (messages)
    // 3. Initialize empty contents array to collect streamed text chunks
    // 4. Execute fetch POST to this.endpoint with headers, method "POST", body JSON.stringify(requestData)
    // 5.1. If response.status === 200:
    //   - get reader from response.body (response.body.getReader())
    //   - create TextDecoder
    //   - initialize buffer = ''
    //   - loop: read chunks from reader until done
    //       - if done: return new Message(Role.ASSISTANT, contents.join(''))
    //       - decode value and append to buffer
    //       - split buffer by '\n', keep last incomplete line in buffer
    //       - for each line:
    //           - if line starts with 'data: ':
    //               - parse JSON data from line.slice(6).trim()
    //               - if parsed.type === 'content_block_delta' and parsed.delta?.type === 'text_delta':
    //                   - get text = parsed.delta.text || ''
    //                   - process.stdout.write(text) and push to contents
    //               - if parsed.type === 'message_stop': break out of reader loop
    // 5.2. Otherwise throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    // 6. Return new Message(Role.ASSISTANT, contents.join(''))
    throw new Error("Not implemented.");
  }
}
