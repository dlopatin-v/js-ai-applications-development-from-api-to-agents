import { Message, Role } from "commons";
import { BaseOpenAiClient } from "../base";

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
  response = async (messages: Message[]): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": this.apiKey,
    };

    const requestData = {
      model: this.modelName,
      instructions: this.systemPrompt,
      input: messages
    };

    const response = await fetch(this.endpoint, {
      headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

    if (response.status === 200) {
      const result = await response.json() as Record<string, unknown>;
      const content = this._extractOutputText(result);

      console.log(content);

      return new Message(Role.ASSISTANT, content);
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
  streamResponse = async (messages: Message[]): Promise<Message> => {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": this.apiKey,
    };

    const requestData = {
      model: this.modelName,
      instructions: this.systemPrompt,
      input: messages,
      stream: true,
    };

    const contents: string[] = [];

    const response = await fetch(this.endpoint, {
      headers,
      method: "POST",
      body: JSON.stringify(requestData)
    });

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
            interface OutputTextDelta { delta?: string }
            const parsed = JSON.parse(data) as OutputTextDelta;
            const delta = parsed.delta;
            if (delta) {
              process.stdout.write(delta);
              contents.push(delta);
            }
          } else if (line === "") {
            eventType = "";
          }
        }
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log();
    return new Message(Role.ASSISTANT, contents.join(''));
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
    const output = (data.output ?? []) as Record<string, unknown>[];
    for (const item of output) {
      const content = (item.content ?? []) as Record<string, unknown>[];
      for (const contentPart of content) {
        if (contentPart.type === "output_text") {
          return contentPart.text as string;
        }
      }
    }
    throw new Error("No output text found in the response");
  };
}
