import Anthropic from "@anthropic-ai/sdk";

import { ANTHROPIC_API_KEY, ANTHROPIC_ENDPOINT, Message, Role } from "../../commons/index.js";
import AIClient from "./base_client";

const API_KEY_HEADER_NAME = "x-api-key";

/**
 * Client for Anthropic's Claude API using raw HTTP fetch.
 *
 * This implementation uses the native fetch API to send direct HTTP requests
 * to the Anthropic Messages endpoint, giving full control over request parameters.
 *
 * Inherits all attributes from AIClient.
 */
export class AnthropicAIClient extends AIClient {
  /**
   * Initialize the Anthropic client.
   *
   * @param modelName The specific model identifier to use.
   */
  constructor(modelName: string) {
    super(ANTHROPIC_ENDPOINT, modelName, ANTHROPIC_API_KEY, API_KEY_HEADER_NAME);
  }

  /**
   * Get a synchronous response from Anthropic's Claude API.
   *
   * @param messages The conversation history.
   * @param printRequest If true, prints the full request (endpoint, headers, body) before sending.
   * @param printOnlyContent If true, prints only the response text; otherwise prints the full response JSON.
   * @param args Optional provider-specific parameters to include in the request body (e.g. `{ temperature: 0.5 }`).
   * @returns The AI's response message.
   *
   * Note: Claude's API uses a separate 'system' parameter for system instructions.
   * Response content blocks are concatenated into a single text response.
   */
  response = async (messages: Message[], printRequest: boolean, printOnlyContent: boolean, args?: Record<string, unknown>): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      [API_KEY_HEADER_NAME]: this.apiKey,
    }

    const requestData = {
      model: this.modelName,
      max_tokens: args?.["max_tokens"] || 1024,
      messages,
      ...(args || {})
    };

    const response = await fetch(this.endpoint, {
      headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if (printRequest) {
      this._printRequest(requestData, headers);
    }

    if (response.status === 200) {
      const result = await response.json() as Anthropic.Message;

      if (!result.content || result.content.length === 0) {
        throw new Error("No choice has been present in the response");
      }

      const message = result.content
        .filter(block => block.type === "text")
        .map(block => (block as Anthropic.TextBlock).text || "")
        .join("");

      if (printOnlyContent) {
        console.log(message);
      } else {
        this._printResponse(JSON.stringify(result, null, 2));
      }
      return new Message(Role.ASSISTANT, message);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}
