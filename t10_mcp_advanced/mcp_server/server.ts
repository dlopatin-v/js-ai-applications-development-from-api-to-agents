import http from "http";
import { MCPRequest } from "./models/request.js";
import { MCPResponse, ErrorResponse, createResponse } from "./models/response.js";
import { UmsMCPServer } from "./ums_mcp_server.js";

const MCP_SESSION_ID_HEADER = "mcp-session-id";
const PORT = 8006;

const mcpServer = new UmsMCPServer();

function validateAcceptHeader(accept: string | undefined): boolean {
  //TODO:
  // 1. If accept is falsy, return false
  // 2. Split by comma, strip and lowercase each part
  // 3. Return true only if both "application/json" and "text/event-stream" are present
  throw new Error("Not implemented.");
}

function sendSseResponse(
  res: http.ServerResponse,
  sessionId: string | undefined,
  response: MCPResponse
): void {
  //TODO:
  // 1. Set headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
  // 2. If sessionId, set MCP_SESSION_ID_HEADER response header
  // 3. Write: `data: ${JSON.stringify(response)}\n\n`
  // 4. End the response
  throw new Error("Not implemented.");
}

function sendError(res: http.ServerResponse, status: number, body: string): void {
  //TODO:
  // 1. Set status code and Content-Type: application/json
  // 2. End the response with body
  throw new Error("Not implemented.");
}

const server = http.createServer(async (req, res) => {
  //TODO:
  // 1. Only handle POST /mcp and DELETE /mcp; return sendError(405, "Method Not Allowed") otherwise
  //
  // 2. Handle DELETE: extract mcp-session-id header; return 200 OK (session teardown)
  //
  // 3. For POST: validate Accept header with validateAcceptHeader();
  //    if invalid, return sendError(406, JSON.stringify MCPResponse with error -32600)
  //
  // 4. Read body chunks manually and JSON.parse into MCPRequest
  //
  // 5. If method === "initialize":
  //    - Call mcpServer.handleInitialize(request); get { response, sessionId }
  //    - Call sendSseResponse(res, sessionId, response)
  //
  // 6. Else (all other methods require a session):
  //    - Extract mcp-session-id from request headers
  //    - If missing, return sendError(400, "Missing session ID")
  //    - Get session via mcpServer.getSession(sessionId); if not found return sendError(400, "Invalid session")
  //    - If method === "notifications/initialized":
  //        set session.readyForOperation = true; res.writeHead(202); res.end()
  //    - Else if !session.readyForOperation: return sendError(400, "Session not ready")
  //    - Else dispatch:
  //        tools/list  → mcpServer.handleToolsList(request)
  //        tools/call  → await mcpServer.handleToolsCall(request)
  //        unknown     → MCPResponse with error -32601 "Method not found"
  //    - Call sendSseResponse(res, sessionId, mcp_response)
  throw new Error("Not implemented.");
});

server.listen(PORT, () => {
  console.log(`Custom MCP server running on http://localhost:${PORT}/mcp`);
});
