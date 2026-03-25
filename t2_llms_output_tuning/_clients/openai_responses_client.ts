import { Message, Role, OPENAI_API_KEY, OPENAI_RESPONSES_ENDPOINT } from "../../commons";
import AIClient from "./base_client";
import { OpenAI } from "openai";

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
    super(OPENAI_RESPONSES_ENDPOINT, modelName, OPENAI_API_KEY, API_KEY_HEADER_NAME);
    this.client = new OpenAI({
      apiKey: this.apiKey
    });
  }

  client: OpenAI;

  /**
   * Sends a non-streaming request to the OpenAI Responses API.
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
      "Authorization": this.apiKey,
    };

    const requestData = {
      model: this.modelName,
      input: messages,
      ...(args || {})
    };

    if (printRequest) {
      this._printRequest(requestData, headers);
    }

    const response = await this.client.responses.create({
      model: this.modelName,
      input: messages as any,
      ...(args || {})
    });

    const text = response.output_text;

    if (printOnlyContent) {
      console.log(text);
    } else {
      this._printResponse(JSON.stringify(text, null, 2));
    }

    return new Message(Role.ASSISTANT, text);
  };
}
