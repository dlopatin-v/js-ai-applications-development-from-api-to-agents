export abstract class BaseTool {
  /** Run the tool with the given arguments and return the result as a string. */
  abstract execute(args: Record<string, unknown>): Promise<string>;

  /** Unique identifier used as the function name in tool schemas and for lookup. */
  abstract get name(): string;

  /** Short description the model uses to decide when to call this tool. */
  abstract get description(): string;

  /**
   * JSON Schema object describing the tool's input parameters.
   * Must follow the JSON Schema draft-07 object format:
   *   { type: "object", properties: { ... }, required: [...] }
   */
  abstract get inputSchema(): Record<string, unknown>;

  /** Tool schema formatted for the OpenAI Chat Completions API.
   *  Wraps name/description/inputSchema in: { type: "function", function: { ... } }
   */
  get openaiSchema(): Record<string, unknown> {
    return {
      type: "function",
      function: {
        name: this.name,
        description: this.description,
        parameters: this.inputSchema,
      },
    };
  }

  /** Tool schema formatted for the Anthropic Messages API.
   *  Flat dict: { name, description, input_schema } — no "type: function" wrapper.
   */
  get anthropicSchema(): Record<string, unknown> {
    return {
      name: this.name,
      description: this.description,
      input_schema: this.inputSchema,
    };
  }
}
