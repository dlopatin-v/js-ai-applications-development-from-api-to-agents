import { OpenAI, ResponseInput } from "openai";
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
  constructor(...args: ConstructorParameters<typeof BaseOpenAiClient>) {
    super(...args);
    this.client = new OpenAI({
      apiKey: this.apiKey
    });
  }

  client: OpenAI;

  /**
   * Sends a non-streaming request to the OpenAI Responses API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    const response = await this.client.responses.create({
      model: this.modelName,
      instructions: this.systemPrompt,
      input: messages as ResponseInput,
    });

    console.log(response.output_text);

    return new Message(Role.ASSISTANT, response.output_text);
  };
}
