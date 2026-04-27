import { OpenAI } from "openai";
import { Message, Role } from "../../../commons";
import { BaseOpenAiClient } from "../base";

/**
 * Client for OpenAI Responses API using the official SDK.
 *
 * This implementation uses the official OpenAI library to interact with the
 * Responses API, which uses `instructions` instead of system messages and
 * `input` instead of messages.
 *
 * @property client The OpenAI SDK client instance.
 */
export class OpenAIResponsesClient extends BaseOpenAiClient {
  client!: OpenAI;

  constructor(...args: ConstructorParameters<typeof BaseOpenAiClient>) {
    super(...args);
    //TODO:
    // - Initialize the OpenAI SDK client https://github.com/openai/openai-node
    // Note: `this.apiKey` already contains the 'Bearer ' prefix (added by BaseOpenAiClient).
    //       The OpenAI SDK adds its own 'Bearer ' prefix, so strip it first:
    //       `this.client = new OpenAI({ apiKey: this.apiKey.replace(/^Bearer /, '') })`
    throw new Error("Not implemented.");
  }

  /**
   * Sends a non-streaming request to the OpenAI Responses API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Prepare input messages
    // - Call the SDK client (use instructions for system prompt)
    // - Print the response to console
    // - Return an ASSISTANT Message
    throw new Error("Not implemented.");
  };

  /**
   * Sends a streaming request to the OpenAI Responses API.
   *
   * The response is streamed using event-based streaming, with each delta
   * written to stdout immediately as it arrives.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    //TODO:
    // - Prepare input messages
    // - Call the SDK client with streaming enabled
    // - Listen for 'response.output_text.delta' events and write to stdout
    // - Return the assembled ASSISTANT Message
    throw new Error("Not implemented.");
  };
}
