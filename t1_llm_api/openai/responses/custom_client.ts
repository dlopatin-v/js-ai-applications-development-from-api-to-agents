import { BaseOpenAiClient } from "../base";

import { Message, Role } from "../../../commons";

/**
 * Custom HTTP client for OpenAI Responses API.
 *
 * This implementation uses raw fetch requests instead of the official SDK,
 * demonstrating how to interact with the Responses API directly and handle
 * its event-based Server-Sent Events (SSE) streaming format.
 */
export class CustomOpenAIResponsesClient extends BaseOpenAiClient {

  /**
   * Sends a non-streaming request using a raw HTTP POST to the Responses API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://platform.openai.com/docs/api-reference/responses/create
    // - Prepare headers with authorization and content type
    // - Prepare input messages (use instructions for system prompt)
    // - Execute POST request to the API
    // - Parse the response using this._extractOutputText(result)
    // - Print the response to console
    // - Return an ASSISTANT Message
    throw new Error("Not implemented.");
  };

  /**
   * Sends a streaming request using raw HTTP with event-based Server-Sent Events (SSE).
   *
   * The Responses API uses named events (e.g. `response.output_text.delta`) followed
   * by a data payload. Each delta is written to stdout immediately as it arrives.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://platform.openai.com/docs/api-reference/responses/create (Streaming tab)
    // - Prepare headers with authorization and content type
    // - Prepare input messages (use instructions for system prompt)
    // - Execute POST request with stream: true
    // - Read the SSE stream: track "event: " lines, parse "data: " for 'response.output_text.delta'
    // - Write delta chunks to stdout
    // - Return the assembled ASSISTANT Message
    throw new Error("Not implemented.");
  };

  /**
   * Extract text content from the Responses API output.
   *
   * @param data The JSON response data from the API.
   * @returns The extracted text content.
   */
  private _extractOutputText = (data: Record<string, unknown>): string => {
    //TODO:
    // - Iterate through data.output items
    // - For each item, check its content array
    // - Return the text of the first content part with type "output_text"
    // - Throw an error if not found
    throw new Error("Not implemented.");
  };
}
