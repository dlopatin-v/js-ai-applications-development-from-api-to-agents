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

  private headers = {
    "Content-Type": "application/json",
    "x-api-key": this.apiKey,
    "anthropic-version": "2023-06-01"
  }

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
  response = async (messages: Message[]): Promise<Message> => {
    const requestData = {
      model: this.modelName,
      system: this.systemPrompt,
      max_tokens: 1024,
      messages
    };

    const response = await fetch(this.endpoint, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      const result = await response.json() as Anthropic.Message;
      const message = result.content
        .filter(block => block.type === "text")
        .map(block => (block as Anthropic.TextBlock).text || "")
        .join("");

      console.log(message);

      return new Message(Role.ASSISTANT, message);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
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
   * Each delta is printed to stdout as it arrives.
   */
  streamResponse = async (messages: Message[]): Promise<Message> => {
    const requestData = {
      model: this.modelName,
      system: this.systemPrompt,
      max_tokens: 1024,
      stream: true,
      messages
    };

    const response = await fetch(this.endpoint, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });
    const contents: string[] = [];

    if (response.status === 200) {
      if (!response.body) {
        throw new Error("Missing body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      outer: while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            interface AnthropicStreamChunk {
              type: string;
              delta?: { type: string; text?: string };
            }
            const parsed = JSON.parse(data) as AnthropicStreamChunk;
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              const text = parsed.delta.text || '';
              process.stdout.write(text);
              contents.push(text);
            } else if (parsed.type === 'message_stop') {
              break outer;
            }
          }
        }
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log();
    return new Message(Role.ASSISTANT, contents.join(''));
  }
}
