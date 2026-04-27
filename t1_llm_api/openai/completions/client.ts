import { OpenAI } from "openai";
import { Message, Role } from "../../../commons/index.js";
import { BaseOpenAiClient } from "../base";

/**
 * Client for OpenAI Chat Completions API using the official SDK.
 *
 * This implementation uses the official OpenAI library to interact with the
 * Chat Completions API, providing both non-streaming and streaming response
 * capabilities.
 *
 * @property client The OpenAI SDK client instance.
 */
export class OpenAIClient extends BaseOpenAiClient {
  client!: OpenAI;

  constructor(...args: ConstructorParameters<typeof BaseOpenAiClient>) {
    super(...args);
    //TODO:
    // https://github.com/openai/openai-node#usage
    // 1. Initialize OpenAI client: `this.client = new OpenAI({ apiKey: this.apiKey.replace(/^Bearer /, '') })`
    //    Note: `this.apiKey` already contains the 'Bearer ' prefix (added by BaseOpenAiClient).
    //          The OpenAI SDK adds its own 'Bearer ' prefix, so you must strip it first.
    throw new Error("Not implemented.");
  }

  /**
   * Sends a non-streaming request to the OpenAI Chat Completions API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
    // 0. Make a request in Postman to see the request and response
    // 1. Prepare messages list with system message first:
    //   const messagesWithSystem = [{ role: "system", content: this.systemPrompt }, ...messages]
    // 2. Create completion using OpenAI client:
    //   - call `this.client.chat.completions.create()` with:
    //     - model: this.modelName
    //     - messages: messagesWithSystem as ChatCompletionMessageParam[]
    // 3. Extract content from response: `const content = completion.choices[0].message.content`
    // 4. Print content
    // 5. Return ASSISTANT message
    throw new Error("Not implemented.");
  };

  /**
   * Sends a streaming request to the OpenAI Chat Completions API.
   *
   * The response is streamed token-by-token, with each chunk written to
   * stdout immediately as it arrives.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create
    // 0. Make a request in Postman to see the request and response
    // 1. Prepare messages list with system message first:
    //   const messagesWithSystem = [{ role: "system", content: this.systemPrompt }, ...messages]
    // 2. Initialize empty contents array to collect streamed chunks
    // 3. Create streaming completion using OpenAI client:
    //   - call `this.client.chat.completions.create()` with:
    //     - model: this.modelName
    //     - stream: true
    //     - messages: messagesWithSystem as ChatCompletionMessageParam[]
    // 4. Iterate through stream chunks using `for await (const chunk of stream):`
    // 5. For each chunk, check if delta content exists:
    //   - `const deltaContent = chunk.choices[0]?.delta?.content`
    //   - if deltaContent exists: push to contents array, write to stdout
    // 6. Print empty line (for formatting)
    // 7. Return ASSISTANT message with joined contents: `new Message(Role.ASSISTANT, contents.join(''))`
    throw new Error("Not implemented.");
  };
}
