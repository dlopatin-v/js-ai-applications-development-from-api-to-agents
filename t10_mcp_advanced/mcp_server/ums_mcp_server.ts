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
    //TODO:
    // 1. Create instances of all 5 tools: GetUserByIdTool, SearchUsersTool, CreateUserTool, UpdateUserTool, DeleteUserTool
    // 2. Iterate through the list and add each to this.tools with tool.name as the key
  }

  getSession(sessionId: string): MCPSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  handleInitialize(request: MCPRequest): { response: MCPResponse; sessionId: string } {
    //TODO:
    // 1. Generate sessionId = randomUUID().replace(/-/g, "")
    // 2. Create and store a new MCPSession in this.sessions: { sessionId, readyForOperation: false, createdAt: Date.now(), lastActivity: Date.now() }
    // 3. Extract protocolVersion from request.params?.protocolVersion ?? this.protocolVersion
    // 4. Build MCPResponse using createResponse(request.id, {
    //      protocolVersion,
    //      capabilities: { tools: {}, resources: {}, prompts: {} },
    //      serverInfo: this.serverInfo
    //    })
    // 5. Return { response, sessionId }
  }

  handleToolsList(request: MCPRequest): MCPResponse {
    //TODO:
    // 1. Build toolsList by calling tool.toMcpTool() on each entry in this.tools
    // 2. Return createResponse(request.id, { tools: toolsList })
  }

  async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
    //TODO:
    // 1. If !request.params, return createResponse with error: ErrorResponse(-32602, "Missing parameters")
    // 2. Extract toolName = request.params.name, arguments = request.params.arguments ?? {}
    // 3. If !toolName, return createResponse with error: ErrorResponse(-32602, "Missing required parameter: name")
    // 4. Look up tool by toolName; if not found return error: ErrorResponse(-32601, `Tool '${toolName}' not found`)
    // 5. Try: result = await tool.execute(arguments); return createResponse(request.id, { content: [{ type: "text", text: result }] })
    //    Catch: return createResponse(request.id, { content: [{ type: "text", text: `Tool execution error: ${e}` }], isError: true })
  }
}
