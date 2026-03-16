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

  /**
   * Converts Message objects to Gemini's content dictionary format.
   *
   * Gemini uses a different role naming convention where AI messages use
   * the role "model" instead of "assistant".
   *
   * @param messages Conversation messages to convert.
   * @returns Messages formatted as Gemini content objects (array of dicts).
   */
  private _toGeminiContents = (messages: Array<Message>): Array<{role: string, parts: Array<{text: string}>}> => {
    //TODO:
    // 1. Initialize empty contents array
    // 2. Iterate through messages:
    //   - get role from message: `const role = message.role`
    //   - push to contents: `{ role, parts: [{ text: message.content }] }`
    // 3. Return contents array
    throw new Error("Not implemented.");
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
    //TODO:
    // https://ai.google.dev/gemini-api/docs/text-generation
    // 0. Make a request in Postman to see the request and response
    // 1. Construct URL: `const url = \`${this.endpoint}/${this.modelName}:generateContent\``
    // 2. Prepare headers object with:
    //   - "Content-Type" ("application/json")
    //   - "x-goog-api-key" (this.apiKey)
    // 3. Prepare request data object:
    //   - "system_instruction" ({ parts: [{ text: this.systemPrompt }] })
    //   - "contents" (this._toGeminiContents(messages))
    //   - "generationConfig" ({ maxOutputTokens: 1024 })
    // 4. Execute fetch POST to url with headers, method "POST", body JSON.stringify(requestData)
    // 5.1. If response.status === 200 then:
    //   - get response json
    //   - get candidates: result.candidates
    //   - if candidates are present:
    //       - get parts: candidates[0].content.parts
    //       - get content: parts.map(part => part.text || "").join("")
    //       - console.log(message)
    //       - return new Message(Role.ASSISTANT, message)
    //   - throw new Error("No candidates present in the response")
    // 5.2. Otherwise throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    throw new Error("Not implemented.");
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
    //TODO:
    // https://ai.google.dev/gemini-api/docs/text-generation
    // 0. Make a request in Postman to see the request and response
    // 1. Construct URL: `const url = \`${this.endpoint}/${this.modelName}:streamGenerateContent?alt=sse\``
    // 2. Prepare headers object with:
    //   - "Content-Type" ("application/json")
    //   - "x-goog-api-key" (this.apiKey)
    // 3. Prepare request data object:
    //   - "system_instruction" ({ parts: [{ text: this.systemPrompt }] })
    //   - "contents" (this._toGeminiContents(messages))
    //   - "generationConfig" ({ maxOutputTokens: 1024 })
    // 4. Initialize empty contents array to collect streamed text chunks
    // 5. Execute fetch POST to url with headers, method "POST", body JSON.stringify(requestData)
    // 6.1. If response.status === 200:
    //   - get reader from response.body (response.body.getReader())
    //   - create TextDecoder
    //   - initialize buffer = ''
    //   - loop: read chunks from reader until done
    //       - decode value and append to buffer
    //       - split buffer by '\n', keep last incomplete line in buffer
    //       - for each line:
    //           - if line starts with 'data: ':
    //               - parse JSON data from line.slice(6).trim()
    //               - get candidates: parsed.candidates
    //               - iterate parsed.candidates[0].content.parts:
    //                   - process.stdout.write(part.text) and push to contents
    // 6.2. Otherwise throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    // 7. Print empty line (console.log())
    // 8. Return new Message(Role.ASSISTANT, contents.join(''))
    throw new Error("Not implemented.");
  }
}
