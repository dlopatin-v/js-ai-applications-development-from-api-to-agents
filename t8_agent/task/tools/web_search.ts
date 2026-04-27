import { OPENAI_API_KEY, OPENAI_RESPONSES_ENDPOINT } from "../../../commons";
import { BaseTool } from "./base";

export class WebSearchTool extends BaseTool {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor(openAiApiKey: string = OPENAI_API_KEY) {
    super();
    this.apiKey = `Bearer ${openAiApiKey}`;
    this.endpoint = OPENAI_RESPONSES_ENDPOINT;
  }

  // TODO: Provide tool name as `web_search_tool`
  get name(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide description of this tool
  get description(): string {
    throw new Error("Not implemented");
  }

  // TODO: Provide tool params Schema (it applies `request` string to search by)
  get inputSchema(): Record<string, unknown> {
    throw new Error("Not implemented");
  }

  async execute(args: Record<string, unknown>): Promise<string> {
    // TODO:
    // https://developers.openai.com/api/docs/guides/tools-web-search
    // 1. Make POST call to `gpt-5.2` with request "tools": [{"type": "web_search"}],
    // 2. Check if response status is 200 and if yes then return message content, otherwise return `Error: ${response.status} ${text}`
    throw new Error("Not implemented");
  }
}
