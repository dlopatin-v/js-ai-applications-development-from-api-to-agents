import { Content, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../../commons";
import AIClient from "../base_client";

/**
 * Custom HTTP client for Google Gemini API.
 *
 * This implementation uses raw fetch requests instead of the official SDK,
 * demonstrating how to interact with Gemini's API directly and handle its
 * Server-Sent Events (SSE) streaming format.
 */
export class CustomGeminiAIClient extends AIClient {

  private headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": this.apiKey,
  }

  /**
   * Converts Message objects to Gemini's content dictionary format.
   *
   * @param messages Conversation messages to convert.
   * @returns Messages formatted as Gemini Content objects.
   */
  private convertToGeminiContent = (messages: Array<Message>): Content[] => {
    return messages.map((message): Content => ({
      role: message.role,
      parts: [{text: message.content}],
    }))
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
  response = async (messages: Array<Message>): Promise<Message> => {
    const url = `${this.endpoint}/${this.modelName}:generateContent`;
    const requestData = {
      system_instruction: {"parts": [{"text": this.systemPrompt}]},
      contents: this.convertToGeminiContent(messages),
      generationConfig: {
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(url, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      const result = await response.json() as GenerateContentResponse;
      const message = result.candidates[0].content.parts
        .map(part => part.text || "")
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
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    const url = `${this.endpoint}/${this.modelName}:streamGenerateContent?alt=sse`;
    const requestData = {
      system_instruction: {"parts": [{"text": this.systemPrompt}]},
      contents: this.convertToGeminiContent(messages),
      generationConfig: {
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(url, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });
    const contents: Array<string> = [];

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
            const parsed = JSON.parse(data);
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

    return new Message(Role.ASSISTANT, contents.join(''));
  }
}
