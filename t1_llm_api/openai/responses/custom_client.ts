import { Message, Role } from "../../../commons";
import { BaseOpenAiClient } from "../base";

/**
 * Custom HTTP client for OpenAI Responses API.
 *
 * This implementation uses raw fetch requests instead of the official SDK,
 * demonstrating how to interact with the Responses API directly and handle
 * its event-based Server-Sent Events (SSE) streaming format.
 */
export class CustomOpenAIResponsesClient extends BaseOpenAiClient {

  private headers = {
    "Content-Type": "application/json",
    "Authorization": this.apiKey,
  }

  /**
   * Sends a non-streaming request using a raw HTTP POST to the Responses API.
   *
   * @param messages Conversation history sent to the model.
   * @returns The AI response as a single message.
   */
  response = async (messages: Array<Message>): Promise<Message> => {
    const requestData = {
      model: this.modelName,
      instructions: this.systemPrompt,
      input: messages
    };

    const response = await fetch(this.endpoint, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      const result = await response.json();
      const message = result.output[0].content[0].text;

      console.log(message);

      return new Message(Role.ASSISTANT, message);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
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
    const requestData = {
      model: this.modelName,
      instructions: this.systemPrompt,
      input: messages,
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
      let eventType = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ') && eventType === 'response.output_text.delta') {
            const data = line.slice(6).trim();
            const parsed = JSON.parse(data);
            const chunk = parsed.delta;
            if (chunk) {
              process.stdout.write(chunk);
              contents.push(chunk);
            }
          } else if (line === "") {
            eventType = "";
          }
        }
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return new Message(Role.ASSISTANT, contents.join(''));
  };
}
