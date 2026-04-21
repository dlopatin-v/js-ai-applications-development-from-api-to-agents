import { OPENAI_API_KEY } from "commons";

export class OpenAIClientT3 {
  constructor(
    public endpoint: string,
  ) {
    if (!OPENAI_API_KEY) {
      throw new Error("API key cannot be null or empty")
    }

    this.apiKey = `Bearer ${OPENAI_API_KEY}`
  }

  apiKey: string;

  call = async ({
                  printRequest = true, printResponse = true, ...args
                }: {
    printRequest?: boolean;
    printResponse?: boolean;
    [key: string]: unknown;
  }): Promise<Record<string, unknown>> => {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": this.apiKey,
    };

    if (printRequest) {
      JSON.stringify(args, null, 2);
    }

    const response = await fetch(this.endpoint, {headers, method: "POST", body: JSON.stringify(args)});

    if (response.status === 200) {
      const result = await response.json() as Record<string, unknown>;

      if (printResponse) {
        console.log(JSON.stringify(result, null, 2));
      }

      return result;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}