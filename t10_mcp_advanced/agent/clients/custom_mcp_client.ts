import { randomUUID } from "crypto";

const MCP_SESSION_ID_HEADER = "Mcp-Session-Id";

export type ToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export class CustomMCPClient {
  private readonly serverUrl: string;
  private sessionId: string | null = null;

  private constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  static async create(serverUrl: string): Promise<CustomMCPClient> {
    const instance = new CustomMCPClient(serverUrl);
    await instance.connect();
    return instance;
  }

  private async _sendRequest(
    method: string,
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const requestBody: { jsonrpc: string; id: string; method: string; params?: Record<string, unknown> } = {
      jsonrpc: "2.0",
      id: randomUUID(),
      method,
    };

    if (params) {
      requestBody.params = params;
    }

    console.log( { method });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };

    if (method !== "initialize" && this.sessionId) {
      headers[MCP_SESSION_ID_HEADER] = this.sessionId;
    }

    const response = await fetch(this.serverUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log({ response });

    // Capture session ID from response header
    const newSessionId = response.headers.get(MCP_SESSION_ID_HEADER);
    if (!this.sessionId && newSessionId) {
      this.sessionId = newSessionId;
    }

    if (response.status === 202) return {};

    const contentType = response.headers.get("content-type") ?? "";

    let data: Record<string, unknown>;
    if (contentType.includes("text/event-stream")) {
      data = await this._parseSseResponse(response);
    } else {
      data = await response.json() as unknown as Record<string, unknown>;
    }

    if (data["error"]) {
      const err = data["error"] as { code: number; message: string };
      throw new Error(`MCP Error ${err.code}: ${err.message}`);
    }

    return data;
  }

  private async _parseSseResponse(response: Response): Promise<Record<string, unknown>> {
    const text = await response.text();
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) continue;
      if (trimmed.startsWith("data: ")) {
        const dataPart = trimmed.slice(6).trim();
        if (dataPart === "[DONE]" || dataPart === "") continue;
        try {
          return JSON.parse(dataPart);
        } catch {}
      }
    }
    throw new Error("No valid JSON data found in SSE stream");
  }

  private async _sendNotification(method: string): Promise<void> {
    const requestBody: { jsonrpc: string; method: string } = { jsonrpc: "2.0", method };
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (this.sessionId) headers[MCP_SESSION_ID_HEADER] = this.sessionId;

    const response = await fetch(this.serverUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const newSessionId = response.headers.get(MCP_SESSION_ID_HEADER);
    if (newSessionId) {
      this.sessionId = newSessionId;
      console.log(`Session ID: ${this.sessionId}`);
    }
  }

  async connect(): Promise<void> {
    const initParams = {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      clientInfo: { name: "my-custom-mcp-client", version: "1.0.0" },
    };

    const initResult = await this._sendRequest("initialize", initParams);
    await this._sendNotification("notifications/initialized");
    console.log(JSON.stringify(initResult, null, 2));
  }

  async getTools(): Promise<ToolSchema[]> {
    const response = await this._sendRequest("tools/list");
    const tools = (response["result"] as Record<string, unknown>)["tools"] as { name: string; description?: string; inputSchema?: Record<string, unknown> }[];
    return tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema ?? {},
      },
    }));
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<string> {
    console.log(`    Calling \`${toolName}\` with`, toolArgs);
    const response = await this._sendRequest("tools/call", {
      name: toolName,
      arguments: toolArgs,
    });

    const content = ((response["result"] as Record<string, unknown>)?.["content"] ?? []) as { type: string; text?: string }[];
    if (content.length > 0) {
      const text = content[0]?.["text"] ?? "";
      console.log(`    ⚙️: ${text}\n`);
      return text;
    }
    return "Unexpected error occurred!";
  }
}
