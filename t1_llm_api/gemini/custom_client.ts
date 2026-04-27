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
   * Converts Message objects to Gemini's content dictionary format.
   *
   * @param messages Conversation messages to convert.
   * @returns Messages formatted as Gemini content objects.
   */
  private _toGeminiContents = (messages: Message[]): {role: string, parts: {text: string}[] }[] => {
    return messages.map(message => ({
      role: message.role,
      parts: [{text: message.content}],
    }));
  }

  /**
   * Sends a non-streaming request using a raw HTTP POST to the Gemini API.
   *
   * The URL is constructed by appending `:generateContent` to the model endpoint.
   * Uses `x-goog-api-key` header for authentication.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Message[]): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": this.apiKey,
    };

    const url = `${this.endpoint}/${this.modelName}:generateContent`;
    const requestData = {
      system_instruction: {"parts": [{"text": this.systemPrompt}]},
      contents: this._toGeminiContents(messages),
      generationConfig: {
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      interface GeminiResponse {
              candidates: { content: { parts: { text: string }[] } }[];
      }
      const result = await response.json() as GeminiResponse;
      const message = result.candidates[0].content.parts
        .map((part: { text: string }) => part.text || "")
        .join("");

      console.log(message);

      return new Message(Role.ASSISTANT, message);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
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
  streamResponse = async (messages: Message[]): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": this.apiKey,
    };

    const url = `${this.endpoint}/${this.modelName}:streamGenerateContent?alt=sse`;
    const requestData = {
      system_instruction: {"parts": [{"text": this.systemPrompt}]},
      contents: this._toGeminiContents(messages),
      generationConfig: {
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(url, {
      headers,
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
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            interface GeminiStreamChunk {
        candidates: { content: { parts: { text: string }[] } }[];
            }
            const parsed = JSON.parse(data) as GeminiStreamChunk;
            parsed.candidates[0].content.parts.forEach((part: { text: string }) => {
              process.stdout.write(part.text);
              contents.push(part.text);
            });
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
