import { OPENAI_API_KEY, OPENAI_RESPONSES_ENDPOINT } from "commons/constants";
import { BaseTool } from "./base";

export class WebSearchTool extends BaseTool {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor(openAiApiKey: string = OPENAI_API_KEY) {
    super();
    this.apiKey = `Bearer ${openAiApiKey}`;
    this.endpoint = OPENAI_RESPONSES_ENDPOINT;
  }

  get name() { return "web_search_tool"; }
  get description() { return "Tool for WEB searching."; }

  get inputSchema(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        request: {
          type: "string",
          description: "The search query or question to search for on the web",
        },
      },
      required: ["request"],
    };
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Authorization": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        tools: [{ type: "web_search" }],
        input: String(args["request"]),
      }),
    });

    if (response.ok) {
      const data = await response.json() as Record<string, unknown>;
      const output = data["output"] as Record<string, unknown>[] | undefined;
      if (output) {
        for (const item of output) {
          if (item["type"] === "message") {
            const content = item["content"] as Record<string, unknown>[] | undefined;
            if (content) {
              for (const block of content) {
                if (block["type"] === "output_text") {
                  return block["text"] as string;
                }
              }
            }
          }
        }
      }
      return "No result returned from web search.";
    } else {
      const text = await response.text();
      return `Error: ${response.status} ${text}`;
    }
  }
}
