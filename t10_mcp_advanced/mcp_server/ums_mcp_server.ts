import { randomUUID } from "crypto";

import { MCPRequest } from "./models/request";
import { MCPResponse, createResponse } from "./models/response";
import { BaseTool } from "./tools/base";
import { CreateUserTool } from "./tools/users/create_user_tool";
import { DeleteUserTool } from "./tools/users/delete_user_tool";
import { GetUserByIdTool } from "./tools/users/get_user_by_id_tool";
import { SearchUsersTool } from "./tools/users/search_users_tool";
import { UpdateUserTool } from "./tools/users/update_user_tool";

export interface MCPSession {
  sessionId: string;
  readyForOperation: boolean;
  createdAt: number;
  lastActivity: number;
}

export class UmsMCPServer {
  private readonly protocolVersion = "2025-11-25";
  private readonly serverInfo = { name: "custom-ums-mcp-server", version: "1.0.0" };
  private sessions: Map<string, MCPSession> = new Map();
  private tools: Map<string, BaseTool> = new Map();

  constructor() {
    this._registerTools();
  }

  private _registerTools(): void {
    const toolList: BaseTool[] = [
      new GetUserByIdTool(),
      new SearchUsersTool(),
      new CreateUserTool(),
      new UpdateUserTool(),
      new DeleteUserTool(),
    ];
    for (const tool of toolList) {
      this.tools.set(tool.name, tool);
    }
  }

  getSession(sessionId: string): MCPSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  handleInitialize(request: MCPRequest): { response: MCPResponse; sessionId: string } {
    const sessionId = randomUUID().replace(/-/g, "");
    const session: MCPSession = {
      sessionId,
      readyForOperation: false,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    this.sessions.set(sessionId, session);

    const protocolVersion = request.params?.["protocolVersion"] ?? this.protocolVersion;
    const response = createResponse(request.id, {
      protocolVersion,
      capabilities: {
        tools: { listChanged: false },
        resources: null,
        prompts: null,
      },
      serverInfo: this.serverInfo,
    });

    return { response, sessionId };
  }

  handleToolsList(request: MCPRequest): MCPResponse {
    const toolsList = Array.from(this.tools.values()).map((t) => t.toMcpTool());
    return createResponse(request.id, { tools: toolsList });
  }

  async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
    if (!request.params) {
      return createResponse(request.id, undefined, { code: -32602, message: "Missing parameters" });
    }

    const toolName = request.params["name"] as string | undefined;
    const arguments_: Record<string, unknown> = (request.params["arguments"] ?? {}) as Record<string, unknown>;
    console.log(request);

    if (!toolName) {
      return createResponse(request.id, undefined, { code: -32602, message: "Missing required parameter: name" });
    }

    const tool = this.tools.get(toolName);
    if (!tool) {
      return createResponse(request.id, undefined, { code: -32601, message: `Tool '${toolName}' not found` });
    }

    try {
      const resultText = await tool.execute(arguments_);
      return createResponse(request.id, {
        content: [{ type: "text", text: resultText }],
      });
    } catch (err) {
      return createResponse(request.id, {
        content: [{ type: "text", text: `Tool execution error: ${err}` }],
        isError: true,
      });
    }
  }
}
