import http from "http";
import { MCPRequest } from "./models/request.js";
import { MCPResponse } from "./models/response.js";
import { UmsMCPServer } from "./ums_mcp_server.js";

const MCP_SESSION_ID_HEADER = "mcp-session-id";
const PORT = 8006;

const mcpServer = new UmsMCPServer();

function validateAcceptHeader(accept: string | undefined): boolean {
  // TODO
}

function sendSseResponse(
  res: http.ServerResponse,
  sessionId: string | undefined,
  response: MCPResponse
): void {
  // TODO
}

function sendError(res: http.ServerResponse, status: number, body: string): void {
  // TODO
}

const server = http.createServer(async (req, res) => {
  // TODO
});

server.listen(PORT, () => {
  console.log(`Custom MCP server running on http://localhost:${PORT}/mcp`);
});
