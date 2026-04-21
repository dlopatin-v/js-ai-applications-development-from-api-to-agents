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

  /**
   * Looks up an existing session by its session ID.
   * @param sessionId - The session ID string to look up.
   * @returns The MCPSession if found, or undefined.
   */
  getSession(sessionId: string): MCPSession | undefined {
    // TODO
  }

  /**
   * Handles the "initialize" JSON-RPC method: creates a new session and returns server capabilities.
   * @param request - The parsed MCPRequest for the initialize call.
   * @returns An object containing the MCPResponse (capabilities, serverInfo, protocolVersion)
   *          and the newly generated sessionId string.
   * Hint: generate a UUID for the sessionId; store a new MCPSession in this.sessions.
   */
  handleInitialize(request: MCPRequest): { response: MCPResponse; sessionId: string } {
    // TODO
  }

  /**
   * Handles the "tools/list" JSON-RPC method: returns metadata for all registered tools.
   * @param request - The parsed MCPRequest for the tools/list call.
   * @returns An MCPResponse whose result contains { tools: McpTool[] }.
   * Hint: call tool.toMcpTool() on each entry in this.tools; wrap in createResponse().
   */
  handleToolsList(request: MCPRequest): MCPResponse {
    // TODO
  }

  /**
   * Handles the "tools/call" JSON-RPC method: finds and executes the requested tool.
   * @param request - The MCPRequest containing params.name and params.arguments.
   * @returns An MCPResponse whose result contains { content: [{ type: "text", text: string }] }.
   *          Returns an error response if the tool is not found or throws.
   * Hint: look up the tool by name; call tool.execute(params.arguments); catch errors.
   */
  async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
    // TODO
  }
}
