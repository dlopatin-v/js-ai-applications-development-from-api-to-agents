import http from "http";
import { MCPRequest } from "./models/request.js";
import { MCPResponse } from "./models/response.js";
import { UmsMCPServer } from "./ums_mcp_server.js";

const MCP_SESSION_ID_HEADER = "mcp-session-id";
const PORT = 8006;

const mcpServer = new UmsMCPServer();

/**
 * Validates that the request Accept header includes both required MIME types.
 * @param accept - The value of the incoming Accept header.
 * @returns true if the header includes "application/json" AND "text/event-stream".
 */
function validateAcceptHeader(accept: string | undefined): boolean {
  // TODO
}

/**
 * Writes a JSON-RPC response to the client as an SSE event stream.
 * @param res - The HTTP server response to write to.
 * @param sessionId - The MCP session id to include in the response header.
 * @param response - The MCPResponse object to serialise as a `data:` SSE line.
 * Hint: set Content-Type to text/event-stream; write "data: <json>\n\n".
 */
function sendSseResponse(
  res: http.ServerResponse,
  sessionId: string | undefined,
  response: MCPResponse
): void {
  // TODO
}

/**
 * Sends a plain JSON error response with the given HTTP status code.
 * @param res - The HTTP server response to write to.
 * @param status - HTTP status code (e.g. 400, 405, 500).
 * @param body - JSON string to send as the response body.
 */
function sendError(res: http.ServerResponse, status: number, body: string): void {
  // TODO
}

/**
 * Main HTTP request handler for the custom MCP server.
 * Routes incoming requests to the correct MCP handler based on method and headers.
 * - Only accepts POST /mcp
 * - Validates the Accept header
 * - Reads and parses the JSON body
 * - Dispatches initialize / tools/list / tools/call / notifications
 * - Handles DELETE for session teardown
 * Hint: use req.method, req.url, req.headers; read body chunks manually.
 */
const server = http.createServer(async (req, res) => {
  // TODO
});

server.listen(PORT, () => {
  console.log(`Custom MCP server running on http://localhost:${PORT}/mcp`);
});
