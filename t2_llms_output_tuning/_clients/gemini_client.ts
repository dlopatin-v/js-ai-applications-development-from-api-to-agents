import { GEMINI_API_KEY, GEMINI_ENDPOINT, Message, Role } from "../../commons";
import AIClient from "./base_client";

const API_KEY_HEADER_NAME = "x-goog-api-key";

/**
 * Client for Google Gemini API using raw HTTP fetch.
 *
 * This implementation uses the native fetch API to send direct HTTP requests
 * to the Gemini generateContent endpoint, giving full control over request parameters.
 *
 * Inherits all attributes from AIClient.
 */
export class GeminiAICLient extends AIClient {
  /**
   * Initialize the Gemini client.
   *
   * @param modelName The specific model identifier to use.
   */
  constructor(modelName: string) {
    super(GEMINI_ENDPOINT, modelName, GEMINI_API_KEY, API_KEY_HEADER_NAME);
  }

  /**
   * Convert Message objects to Gemini Content format.
   *
   * @param messages The conversation messages to convert.
   * @returns Messages in Gemini's Content format.
   */
  private _toGeminiContents = (messages: Array<Message>): Array<{role: string, parts: Array<{text: string}> }> => {
    return messages.map(message => ({
      role: message.role,
      parts: [{text: message.content}],
    }));
  }

  /**
   * Get a synchronous response from Google's Gemini API.
   *
   * @param messages The conversation history.
   * @param printRequest If true, prints the full request (endpoint, headers, body) before sending.
   * @param printOnlyContent If true, prints only the response text; otherwise prints the full response JSON.
   * @param args Optional provider-specific parameters to include in the request body (e.g. `{ generationConfig: { temperature: 0.5 } }`).
   * @returns The AI's response message.
   *
   * Note: Gemini requires a model-specific URL and wraps generation settings in a generationConfig object.
   */
  response = async (messages: Array<Message>, printRequest: boolean, printOnlyContent: boolean, args?: any): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      [API_KEY_HEADER_NAME]: this.apiKey,
    };

    const url = `${this.endpoint}/${this.modelName}:generateContent`;
    const requestData = {
      contents: this._toGeminiContents(messages),
      generationConfig: args?.["generationConfig"] || { maxOutputTokens: 1024 }
    };

    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if(args?.["safetySettings"]) {
      requestData["safetySettings"] = args?.["safetySettings"];
    }

    if (printRequest) {
      this._printRequest(requestData, headers);
    }


    if (response.status === 200) {
      const result = await response.json();
      const message = result.candidates[0].content.parts
        .map((part: { text: string }) => part.text || "")
        .join("");

      if (printOnlyContent) {
        console.log(message);
      } else {
        this._printResponse(JSON.stringify(result, null, 2));
      }
    // @TODO Add error handling for no Value "No Choice has been present in the response"
      return new Message(Role.ASSISTANT, message);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };
}