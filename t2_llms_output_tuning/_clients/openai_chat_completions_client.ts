import { OpenAI, ChatCompletionMessageParam } from "openai";
import { Message, Role } from "../../../commons";
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
  constructor(...args: ConstructorParameters<typeof BaseOpenAiClient>) {
    super(...args);
    this.client = new OpenAI({
      apiKey: this.apiKey
    });
  }

  client: OpenAI;

  /**
   * Sends a non-streaming request to the OpenAI Chat Completions API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    const messagesWithSystem = [
      { role: "system", content: this.systemPrompt },
      ...messages
    ];
    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages: messagesWithSystem as ChatCompletionMessageParam[],
    });

    console.log(completion.choices[0].message.content);

    return new Message(Role.ASSISTANT, completion.choices[0].message.content);
  };
}
