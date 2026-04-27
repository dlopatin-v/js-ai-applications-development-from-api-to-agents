import express, { Request, Response } from "express";

import { MCPRequest } from "./models/request";
import { MCPResponse } from "./models/response";
import { UmsMCPServer } from "./ums_mcp_server";

const MCP_SESSION_ID_HEADER = "mcp-session-id";
const PORT = 8006;

const mcpServer = new UmsMCPServer();

function validateAcceptHeader(accept: string | undefined): boolean {
  // TODO:
  // 1. If `accept` is falsy, return `false`
  // 2. Split `accept` by commas and trim+lowercase each part to produce `acceptTypes`
  // 3. Check if any entry contains `"application/json"` — assign to `hasJson`
  // 4. Check if any entry contains `"text/event-stream"` — assign to `hasSse`
  // 5. Return `hasJson && hasSse`
  throw new Error("Not implemented");
}

function sendSseResponse(
  res: Response,
  sessionId: string | undefined,
  response: MCPResponse
): void {
  // TODO:
  // 1. Build the SSE payload: `"data: " + JSON.stringify(response) + "\n\n"`
  // 2. Build headers object: `{ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" }`
  //    If `sessionId` is defined, add `[MCP_SESSION_ID_HEADER]: sessionId` to the headers
  // 3. Call `res.writeHead(200, headers)` then `res.write(payload)` then `res.end("data: [DONE]\n\n")`
  throw new Error("Not implemented");
}

function sendError(res: Response, status: number, body: string): void {
  // TODO:
  // 1. Call `res.writeHead(status, { "Content-Type": "application/json" })`
  // 2. Call `res.end(body)`
  throw new Error("Not implemented");
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
  // TODO:
  // 1. Validate Accept header:
  //       - Call `validateAcceptHeader(req.headers["accept"])`
  //       - If false, call `sendError(res, 406, JSON.stringify({ error: "Client must accept both application/json and text/event-stream" }))` and return
  // 2. Read the request body:
  //       - Collect chunks with `req.on("data", ...)` and join on `req.on("end", ...)`
  //       - Parse as `MCPRequest` with `JSON.parse`
  // 3. Extract `mcpSessionId` from `req.headers[MCP_SESSION_ID_HEADER]` (may be undefined)
  // 4. Handle initialization (no session required):
  //       - If `request.method === "initialize"`:
  //           - Call `mcpServer.handleInitialize(request)`, destructure `{ response, sessionId }`
  //           - Call `sendSseResponse(res, sessionId, response)` and return
  // 5. Handle other methods (session required):
  //       - If `!mcpSessionId`: call `sendError(res, 400, JSON.stringify({ error: "Missing session ID" }))` and return
  //       - Call `mcpServer.getSession(mcpSessionId)` to get `session`
  //       - If no session: call `sendError(res, 400, "No valid session ID provided")` and return
  //       - Handle notifications/initialized: if `request.method === "notifications/initialized"`:
  //           - Set `session.readyForOperation = true`
  //           - Call `res.writeHead(202, { [MCP_SESSION_ID_HEADER]: session.sessionId })` then `res.end()` and return
  //       - If `!session.readyForOperation`: call `sendError` with status 400 and a "Session not ready" message and return
  //       - Route the method:
  //           - `"tools/list"` → call `mcpServer.handleToolsList(request)`, assign to `mcpResponse`
  //           - `"tools/call"` → call `await mcpServer.handleToolsCall(request)`, assign to `mcpResponse`
  //           - else → build `mcpResponse` as MCPResponse with id=request.id and
  //               error=new ErrorResponse(-32602, `Method '${request.method}' not found`)
  //       - Call `sendSseResponse(res, session.sessionId, mcpResponse)`
  throw new Error("Not implemented.");
});

app.listen(PORT, () => {
  console.log(`Custom MCP server running on http://localhost:${PORT}/mcp`);
});