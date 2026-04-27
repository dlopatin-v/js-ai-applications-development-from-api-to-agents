import { OpenAI } from "openai";

import { Message, Role } from "../../commons";

/** HTTP client for the OpenAI Chat Completions API. */
export class ChatCompletionClient {
  constructor(
    public endpoint: string,
    public modelName: string,
    public apiKey: string,
  ) {
    if (!apiKey) {
      throw new Error("API key cannot be null or empty")
    }
    this.apiKey = `Bearer ${apiKey}`;
  }

  /**
   * Format a message array into a human-readable string for console logging.
   *
   * @param messages - The conversation messages to format.
   * @returns A single string with each message's role and content separated by dividers.
   */
  private getMessageString(messages: Array<Message>): string {
    return messages
      .map((message) => (
        `---Role: ${message.role.toUpperCase()}---\n💬 Message: ${message.content}`
      ))
      .join('--------\n\n');
  }

  /**
   * Send a chat completion request and return the assistant's reply.
   *
   * @param messages - Conversation history to send to the model.
   * @param printRequest - When `true`, logs the request details to the console.
   * @param args - Additional parameters spread into the request body (e.g. `temperature`).
   * @returns A `Message` with `Role.ASSISTANT` containing the model's response.
   */
  async getCompletion(messages: Array<Message>, printRequest = false, ...args: any[]) {
    if (printRequest) {
      console.log(`Getting completion for \`${this.getMessageString(messages)}\` \n\n ---And such parameters: ${JSON.stringify(args)}---`);
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": this.apiKey
    };

    const requestData = {
      model: this.modelName,
      messages,
      ...args
    };
    console.log( { request: JSON.stringify(requestData) })
    const response = await fetch(`${this.endpoint}`, { method: "POST", headers: headers, body: JSON.stringify(requestData) });

    if (response.status === 200) {
      const data = await response.json() as OpenAI.ChatCompletion;
      const choices = data.choices;

      if (choices) {
        const content = choices[0].message.content;
        return new Message(Role.ASSISTANT, content || "");
      }

      throw new Error("No Choice has been present in the response");
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}