/**
 * Abstract base class for all agent tools.
 *
 * A tool is a callable capability the agent can invoke during its reasoning
 * loop. Subclasses define what the tool does (`execute`), how it identifies
 * itself to the model (`name`, `description`), and what arguments it accepts
 * (`inputSchema`). The two schema getters then assemble that information into
 * the format expected by each provider.
 */
export abstract class BaseTool {
  /**
   * Run the tool with the given arguments and return the result as a string.
   *
   * The agent calls this method when the model requests the tool. The returned
   * string is sent back to the model as the tool result.
   *
   * @param args - Key-value pairs matching the fields declared in `inputSchema`.
   *               Values are already parsed objects — no JSON decoding needed.
   * @returns A human- and model-readable string describing the outcome.
   *          Return an informative error message rather than throwing, so the
   *          model can react gracefully.
   */
  abstract execute(args: Record<string, unknown>): Promise<string>;

  /**
   * Unique identifier for this tool.
   *
   * Used as the function name in the tool schema sent to the model and as
   * the key for tool lookup when the model requests a call.
   */
  abstract get name(): string;

  /**
   * Short, clear description of what the tool does.
   *
   * The model uses this text to decide when to call the tool, so it should
   * be specific enough to distinguish this tool from others without being
   * overly verbose.
   */
  abstract get description(): string;

  /**
   * JSON Schema object describing the tool's input parameters.
   *
   * Must follow the JSON Schema draft-07 `object` format:
   * ```ts
   * {
   *   type: "object",
   *   properties: {
   *     param: { type: "string", description: "..." }
   *   },
   *   required: ["param"]
   * }
   * ```
   *
   * This schema is embedded verbatim into both `openaiSchema` (as `parameters`)
   * and `anthropicSchema` (as `input_schema`).
   */
  abstract get inputSchema(): Record<string, unknown>;

  /**
   * Tool schema formatted for the OpenAI Chat Completions API.
   *
   * Wraps `name`, `description`, and `inputSchema` inside the
   * `{ type: "function", function: { ... } }` envelope that OpenAI
   * expects in the `tools` array.
   *
   * Expected output shape:
   * ```ts
   * {
   *   type: "function",
   *   function: {
   *     name: "<tool name>",
   *     description: "<tool description>",
   *     parameters: { <inputSchema> }
   *   }
   * }
   * ```
   *
   * @see https://platform.openai.com/docs/guides/function-calling
   *
   * // TODO: Return an object matching the OpenAI tool schema format above.
   */
  get openaiSchema(): Record<string, unknown> {
    throw new Error("Not implemented");
  }

  /**
   * Tool schema formatted for the Anthropic Messages API.
   *
   * Returns a flat object with `name`, `description`, and `input_schema` —
   * the structure Anthropic expects directly in the `tools` array
   * (no `"type": "function"` wrapper).
   *
   * Expected output shape:
   * ```ts
   * {
   *   name: "<tool name>",
   *   description: "<tool description>",
   *   input_schema: { <inputSchema> }
   * }
   * ```
   *
   * @see https://docs.anthropic.com/en/api/messages
   *
   * // TODO: Return an object matching the Anthropic tool schema format above.
   */
  get anthropicSchema(): Record<string, unknown> {
    throw new Error("Not implemented");
  }
}
