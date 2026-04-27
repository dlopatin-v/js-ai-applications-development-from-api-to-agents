import { BaseTool } from "../tools/base";

import { Message } from "../../../commons/models/message.js";

/**
 * Abstract base class for LLM-backed agents.
 *
 * Subclasses implement provider-specific HTTP communication while sharing
 * common state: model name, credentials, optional system prompt, and a
 * registry of callable tools.
 */
export abstract class BaseAgent<T = unknown> {
  protected readonly _model: string;
  protected readonly _apiKey: string;
  protected readonly _systemPrompt: string | undefined;
  protected readonly _toolsDict: Record<string, BaseTool>;

  /**
   * @param model      Provider-specific model identifier (e.g. 'gpt-5.2', 'claude-sonnet-4-5').
   * @param apiKey     Secret key used to authenticate with the LLM provider.
   * @param tools      Optional list of tools the agent may call.
   * @param systemPrompt  Optional instruction passed to the model before the conversation.
   * @throws Error if apiKey is empty or blank.
   */
  constructor(
    model: string,
    apiKey: string,
    tools: BaseTool[] = [],
    systemPrompt?: string,
  ) {
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("API key cannot be null or empty");
    }

    this._model = model;
    this._apiKey = apiKey;
    this._systemPrompt = systemPrompt;
    this._toolsDict = Object.fromEntries(tools.map((t) => [t.name, t]));
  }

  /**
   * Send the conversation to the LLM and return its reply.
   *
   * Tool calls are handled transparently: if the model requests one or more
   * tools, the agent executes them and recurses until the model returns a
   * plain text response.
   *
   * @param messages       Ordered conversation history (excluding the system prompt).
   * @param printRequest   When true, log the outgoing request / incoming response.
   * @returns The final assistant Message after all tool rounds are complete.
   */
  abstract getResponse(messages: Message<T>[], printRequest?: boolean): Promise<Message<T>>;
}
