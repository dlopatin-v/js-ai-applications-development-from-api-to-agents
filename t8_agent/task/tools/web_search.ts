import { BaseTool } from "./base";

import { OPENAI_RESPONSES_ENDPOINT } from "../../../commons/constants";

export class WebSearchTool extends BaseTool {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor(openAiApiKey: string) {
    super();
    this.apiKey = `Bearer ${openAiApiKey}`;
    this.endpoint = OPENAI_RESPONSES_ENDPOINT;
  }

  get name(): string {
    // TODO: Provide tool name as `web_search_tool`
    throw new Error("Not implemented");
  }

  get description(): string {
    // TODO: Provide description of this tool
    throw new Error("Not implemented");
  }

  get inputSchema(): Record<string, unknown> {
    // TODO: Provide tool params Schema (it applies `request` string to search by)
    throw new Error("Not implemented");
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    // TODO: https://platform.openai.com/docs/guides/tools-web-search
    // 1. POST to this.endpoint with headers: Authorization, Content-Type
    // 2. Body: { model: "gpt-5.2", tools: [{ type: "web_search" }], input: String(args["request"]) }
    // 3. If response.ok: traverse output → message → content → output_text and return the text
    //    Otherwise return `Error: ${response.status} ${text}`
    throw new Error("Not implemented");
  }
}
