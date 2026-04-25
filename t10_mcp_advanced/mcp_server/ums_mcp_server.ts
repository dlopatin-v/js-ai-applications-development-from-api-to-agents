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
    // TODO:
    // 1. Create a list of tool instances: GetUserByIdTool, SearchUsersTool, CreateUserTool, UpdateUserTool, DeleteUserTool
    // 2. Iterate through the list and add each tool to `this.tools` map where key is `tool.name` and value is the tool itself
    throw new Error("Not implemented");
  }

  getSession(sessionId: string): MCPSession | undefined {
    // TODO:
    // 1. Get session from `this.sessions` map by `sessionId`
    // 2. If session exists, update `session.lastActivity` to `Date.now()`
    // 3. Return the session (or `undefined` if not found)
    throw new Error("Not implemented");
  }

  handleInitialize(request: MCPRequest): { response: MCPResponse; sessionId: string } {
    // TODO:
    // 1. Generate a new `sessionId` as `randomUUID().replace(/-/g, "")`
    // 2. Create an `MCPSession` object with `sessionId`, `readyForOperation: false`,
    //    `createdAt: Date.now()`, `lastActivity: Date.now()` and store it in `this.sessions`
    // 3. Determine `protocolVersion`:
    //    `request.params?.protocolVersion ?? this.protocolVersion`
    // 4. Build `response` as an `MCPResponse` with:
    //       - id: request.id
    //       - result: {
    //           protocolVersion: protocolVersion,
    //           capabilities: { tools: {}, resources: {}, prompts: {} },
    //           serverInfo: this.serverInfo
    //         }
    // 5. Return `{ response, sessionId }`
    throw new Error("Not implemented");
  }

  handleToolsList(request: MCPRequest): MCPResponse {
    // TODO:
    // 1. Build `toolsList` by iterating `this.tools.values()` and calling `tool.toMcpTool()` on each
    // 2. Return an `MCPResponse` with id=request.id and result={ tools: toolsList }
    throw new Error("Not implemented");
  }

  async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
    // TODO:
    // 1. If `!request.params`, return MCPResponse with:
    //       - id: request.id
    //       - error: new ErrorResponse(-32602, "Missing parameters")
    // 2. Extract `toolName = request.params.name` and `args = request.params.arguments ?? {}`
    // 3. If `!toolName`, return MCPResponse with:
    //       - id: request.id
    //       - error: new ErrorResponse(-32602, "Missing required parameter: name")
    // 4. If tool not found in `this.tools`, return MCPResponse with:
    //       - id: request.id
    //       - error: new ErrorResponse(-32601, `Tool '${toolName}' not found`)
    // 5. Get `tool = this.tools.get(toolName)!`
    // 6. Try to call `await tool.execute(args)`, assign to `resultText`, and return MCPResponse with:
    //       - id: request.id
    //       - result: { content: [{ type: "text", text: resultText }] }
    // 7. Catch any error and return MCPResponse with:
    //       - id: request.id
    //       - result: { content: [{ type: "text", text: `Tool execution error: ${err}` }], isError: true }
    throw new Error("Not implemented");
  }
}
