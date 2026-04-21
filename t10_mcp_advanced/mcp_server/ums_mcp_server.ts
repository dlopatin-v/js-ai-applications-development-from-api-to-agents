import { randomUUID } from "crypto";
import { MCPRequest } from "./models/request.js";
import { MCPResponse, ErrorResponse, createResponse } from "./models/response.js";
import { BaseTool } from "./tools/base.js";
import { GetUserByIdTool } from "./tools/users/get_user_by_id_tool.js";
import { SearchUsersTool } from "./tools/users/search_users_tool.js";
import { CreateUserTool } from "./tools/users/create_user_tool.js";
import { UpdateUserTool } from "./tools/users/update_user_tool.js";
import { DeleteUserTool } from "./tools/users/delete_user_tool.js";

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
    // TODO
  }

  handleInitialize(request: MCPRequest): { response: MCPResponse; sessionId: string } {
    // TODO
  }

  handleToolsList(request: MCPRequest): MCPResponse {
    // TODO
  }

  async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
    // TODO
  }
}
