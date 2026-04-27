import AIClient from "./base_client";

import { Message, Role, OPENAI_API_KEY, OPENAI_CHAT_COMPLETIONS_ENDPOINT } from "../../commons";

const API_KEY_HEADER_NAME = "Authorization";

/**
 * Client for OpenAI Chat Completions API using raw HTTP fetch.
 *
 * This implementation uses the native fetch API to send direct HTTP requests
 * to the Chat Completions endpoint, giving full control over request parameters.
 */
export class OpenAIClient extends AIClient {
  constructor(modelName: string) {
    super(OPENAI_CHAT_COMPLETIONS_ENDPOINT, modelName, `Bearer ${OPENAI_API_KEY}`, API_KEY_HEADER_NAME);
  }

  /**
   * Sends a non-streaming request to the OpenAI Chat Completions API.
   *
   * @param messages Conversation history sent to the model.
   * @param printRequest If true, prints the full request (endpoint, headers, body) before sending.
   * @param printOnlyContent If true, prints only the response text; otherwise prints the full response JSON.
   * @param args Optional provider-specific parameters to include in the request body (e.g. `{ temperature: 0.5 }`).
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>, printRequest: boolean, printOnlyContent: boolean, args?: any): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      [API_KEY_HEADER_NAME]: this.apiKey,
    };

    const requestData = {
      model: this.modelName,
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
      interface ChatCompletionResponse {
        choices: { message: { content: string } }[];
      }
      const result = await response.json() as ChatCompletionResponse;
      const message = result.choices[0].message.content;

      if (printOnlyContent) {
        console.log(message);
      } else {
        this._printResponse(JSON.stringify(result, null, 2));
      }
      return new Message(Role.ASSISTANT, message);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };
}
