import { Message } from "../../commons/index.js";

/**
 * Abstract base class for AI service clients.
 *
 * This class defines the interface that all AI service implementations must follow.
 * It handles common initialization logic and requires concrete implementations for
 * both synchronous and asynchronous response methods.
 */
class AIClient {
  /**
   * Initialize the AI client with required configuration.
   *
   * @param endpoint The API endpoint URL for the AI service.
   * @param modelName The specific model identifier to use.
   * @param apiKey The API key for authentication.
   * @param apiKeyHeaderName The API key header name (e.g., "Authorization" or "x-api-key") used in HTTP requests.
   *
   * @throws Error if apiKey is null or empty.
   */
  constructor(
    public endpoint: string,
    public modelName: string,
    public apiKey: string,
    public apiKeyHeaderName: string
  ) {
    if (!apiKey) {
      throw new Error("API key cannot be null or empty")
    }
  }

  /**
   * Sends a non-streaming request to the AI provider.
   * Override this in provider-specific clients.
   *
   * @param messages Conversation history sent to the model.
   * @param printRequest If true, prints the full request (endpoint, headers, body) before sending.
   * @param printOnlyContent If true, prints only the response text; otherwise prints the full response JSON.
   * @param args Optional provider-specific parameters to include in the request body (e.g. `{ temperature: 0.5 }`).
   * @returns The AI response as a single message.
   */
  response = async (messages: Message[], printRequest: boolean, printOnlyContent: boolean, args?: Record<string, unknown>): Promise<Message> => {
    throw new Error("Method not implemented.");
  };

  /**
   * Prints a formatted summary of the outgoing HTTP request.
   *
   * Displays the endpoint, sanitized headers (via _safeHeaders), and the full
   * request body as pretty-printed JSON.
   *
   * @param requestData The request payload to be sent to the AI API.
   * @param headers The HTTP headers included in the request.
   */
  protected _printRequest(requestData: Record<string, unknown>, headers: Record<string, string>): void {
    console.log("\n" + "=".repeat(50) + " REQUEST " + "=".repeat(50));
    console.log(`Endpoint: ${this.endpoint}`);

    console.log("\nHeaders:");
    const safeHeaders = this._safeHeaders(headers);
    for (const [key, value] of Object.entries(safeHeaders)) {
      console.log(`  ${key}: ${value}`);
    }

    console.log("\nRequest Body:");
    console.log(JSON.stringify(requestData, null, 2));
  }

  /**
   * Returns a copy of the headers with the API key value redacted.
   *
   * Any header whose value matches this.apiKey is replaced with a masked
   * version: first 8 chars + "..." + last 4 chars (or "***" for short keys).
   *
   * @param headers The original HTTP headers map.
   * @returns A new headers map with the API key value masked.
   */
  protected _safeHeaders(headers: Record<string, string>): Record<string, string> {
    const safeHeaders = { ...headers };
    for (const key of Object.keys(safeHeaders)) {
      if (safeHeaders[key] === this.apiKey) {
        const apiKey = safeHeaders[key];
        safeHeaders[key] = apiKey.length > 12 ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : "***";
      }
    }
    return safeHeaders;
  }

  protected _printResponse(responseData: string): void {
    console.log("\n" + "=".repeat(50) + " RESPONSE " + "=".repeat(50));
    console.log(responseData);
    console.log("=".repeat(109) + "\n");
  }
}

export default AIClient;