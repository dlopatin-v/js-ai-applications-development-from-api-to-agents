import { randomUUID } from "crypto";
import { MCPRequest } from "./models/request.js";
import { MCPResponse, ErrorResponse, createResponse } from "./models/response.js";
import { BaseTool } from "./tools/base.js";
import { GetUserByIdTool } from "./tools/users/getUserByIdTool.js";
import { SearchUsersTool } from "./tools/users/searchUsersTool.js";
import { CreateUserTool } from "./tools/users/createUserTool.js";
import { UpdateUserTool } from "./tools/users/updateUserTool.js";
import { DeleteUserTool } from "./tools/users/deleteUserTool.js";

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

    const toolName: string | undefined = request.params["name"];
    const arguments_: Record<string, any> = request.params["arguments"] ?? {};
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
