import { Message, Role, OPENAI_API_KEY, OPENAI_CHAT_COMPLETIONS_ENDPOINT } from "../../commons";
import AIClient from "./base_client";

const API_KEY_HEADER_NAME = "Authorization";

/**
 * Client for OpenAI Responses API using raw HTTP fetch.
 *
 * This implementation uses the native fetch API to send direct HTTP requests
 * to the Responses endpoint, which uses `input` instead of `messages` and
 * supports extended parameters like `reasoning`, `truncation`, and `metadata`.
 */
export class OpenAIResponsesClient extends AIClient {
  constructor(modelName: string) {
    super(OPENAI_CHAT_COMPLETIONS_ENDPOINT, modelName, OPENAI_API_KEY, API_KEY_HEADER_NAME);
  }

  /**
   * Sends a non-streaming request to the OpenAI Responses API.
   *
   * @param messages Conversation history sent to the model.
   * @param printRequest If true, prints the full request (endpoint, headers, body) before sending.
   * @param printOnlyContent If true, prints only the response text; otherwise prints the full response JSON.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>, printRequest: boolean, printOnlyContent: boolean, ...args: any[]): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": this.apiKey,
    };

    const requestData = {
      model: this.modelName,
      input: messages,
      ...args
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
      const result = await response.json();
      const content = this._extractOutputText(result);

      if (printOnlyContent) {
        console.log(content);
      } else {
        this._printResponse(JSON.stringify(result, null, 2));
      }

      return new Message(Role.ASSISTANT, content);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };

  /**
   * Extract text content from the Responses API output.
   *
   * The Responses API returns structured output with nested objects.
   * This method navigates the structure to find the output_text content.
   *
   * @param data The JSON response data from the API.
   * @returns The extracted text content.
   */
  private _extractOutputText = (data: Record<string, unknown>): string => {
    const output = (data.output ?? []) as Array<Record<string, unknown>>;
    for (const item of output) {
      const content = (item.content ?? []) as Array<Record<string, unknown>>;
      for (const contentPart of content) {
        if (contentPart.type === "output_text") {
          return contentPart.text as string;
        }
      }
    }
    throw new Error("No output text found in the response");
  };
}
