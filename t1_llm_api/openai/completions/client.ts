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
    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages: messages as ChatCompletionMessageParam[],
    });

    console.log(completion.choices[0].message.content);

    return new Message(Role.ASSISTANT, completion.choices[0].message.content);
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
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages: messages as ChatCompletionMessageParam[],
      stream: true
    });

    const contents: Array<string> = [];

    for await (const chunk of stream) {
      const deltaContent = chunk.choices[0]?.delta?.content;
      if (deltaContent) {
        contents.push(deltaContent);
        process.stdout.write(deltaContent);
      }
    }

    return new Message(Role.ASSISTANT, contents.join(''));
  };
}
