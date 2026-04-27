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
    // https://developers.openai.com/api/docs/guides/text?lang=curl
    // 0. Make a request in Postman to see the request and response
    // 1. Prepare headers object with:
    //   - "Authorization" (this.apiKey)
    //   - "Content-Type" ("application/json")
    // 2. Prepare request data object:
    //   - "model" (this.modelName)
    //   - "instructions" (this.systemPrompt)
    //   - "input" (messages)
    // 3. Execute fetch POST to this.endpoint with headers, method "POST", body JSON.stringify(requestData)
    // 4.1. If response.status === 200 then:
    //   - get response json
    //   - get content using this._extractOutputText(result)
    //   - console.log(content)
    //   - return new Message(Role.ASSISTANT, content)
    // 4.2. Otherwise throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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
    // https://developers.openai.com/api/docs/guides/text?lang=curl
    // 0. Make a request in Postman to see the request and response
    // 1. Prepare headers object with:
    //   - "Authorization" (this.apiKey)
    //   - "Content-Type" ("application/json")
    // 2. Prepare request data object:
    //   - "model" (this.modelName)
    //   - "instructions" (this.systemPrompt)
    //   - "input" (messages)
    //   - "stream" (true)
    // 3. Initialize empty contents array to collect streamed text chunks
    // 4. Execute fetch POST to this.endpoint with headers, method "POST", body JSON.stringify(requestData)
    // 5.1. If response.status === 200:
    //   - get reader from response.body (response.body.getReader())
    //   - create TextDecoder
    //   - initialize buffer = '' and eventType = ''
    //   - loop: read chunks from reader until done
    //       - decode value and append to buffer
    //       - split buffer by '\n', keep last incomplete line in buffer
    //       - for each line:
    //           - if line starts with 'event: ':
    //               - eventType = line.slice(7).trim()
    //           - else if line starts with 'data: ' and eventType === 'response.output_text.delta':
    //               - parse JSON data from line.slice(6).trim()
    //               - get delta = parsed.delta
    //               - if delta: process.stdout.write(delta) and push to contents
    //           - else if line === "":
    //               - reset eventType = ""
    // 5.2. Otherwise throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    // 6. Print empty line (console.log())
    // 7. Return new Message(Role.ASSISTANT, contents.join(''))
    throw new Error("Not implemented.");
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
    //TODO:
    // 1. Get output list from data: `const output = (data.output ?? []) as Array<Record<string, unknown>>`
    // 2. Iterate through items in output:
    //   - for each item, get its content array: `(item.content ?? []) as Array<Record<string, unknown>>`
    //   - for each content part:
    //       - if content_part.type === "output_text":
    //           - return content_part.text as string
    // 3. If no output text found, throw new Error("No output text found in the response")
    throw new Error("Not implemented.");
  };
}
