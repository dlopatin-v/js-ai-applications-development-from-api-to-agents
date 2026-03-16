import { Message, Role } from "../../../commons";
import { BaseOpenAiClient } from "../base";

/**
 * Custom HTTP client for OpenAI Chat Completions API.
 *
 * This implementation uses raw fetch requests instead of the official SDK,
 * demonstrating how to interact with the Chat Completions API directly and
 * handle its Server-Sent Events (SSE) streaming format.
 */
export class CustomOpenAIClient extends BaseOpenAiClient {

  private headers = {
    "Content-Type": "application/json",
    "Authorization": this.apiKey,
  }

  /**
   * Sends a non-streaming request using a raw HTTP POST to the Chat Completions API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    const requestData = {
      model: this.modelName,
      messages: messages
    };

    const response = await fetch(this.endpoint, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      const result = await response.json();
      const message = result.choices[0].message.content;

      console.log(message);

      return new Message(Role.ASSISTANT, message);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };

  /**
   * Sends a streaming request using raw HTTP with Server-Sent Events (SSE).
   *
   * The response is streamed token-by-token using OpenAI's SSE format,
   * with each chunk written to stdout immediately as it arrives.
   *
   * @param messages Conversation history sent to the model.
   * @returns The final aggregated AI message after the stream completes.
   */
  streamResponse = async (messages: Array<Message>): Promise<Message> => {
    const requestData = {
      model: this.modelName,
      messages: messages,
      stream: true,
    };

    const response = await fetch(this.endpoint, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });
    const contents: Array<string> = [];

    if (response.status === 200) {
      if (!response.body) {
        throw new Error("Missing body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              return new Message(Role.ASSISTANT, contents.join(''));
            }

            const parsed = JSON.parse(data);
            const chunk = parsed.choices[0].delta.content;
            if (chunk) {
              process.stdout.write(chunk);
              contents.push(chunk);
            }
          }
        }
      }
    }

    return new Message(Role.ASSISTANT, contents.join(''));
  };
}
