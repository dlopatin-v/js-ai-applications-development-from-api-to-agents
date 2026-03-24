import express, { Request, Response } from "express";
import { MCPRequest } from "./models/request.js";
import { MCPResponse } from "./models/response.js";
import { UmsMCPServer } from "./umsMcpServer.js";

const MCP_SESSION_ID_HEADER = "mcp-session-id";
const PORT = 8006;

const mcpServer = new UmsMCPServer();

function validateAcceptHeader(accept: string | undefined): boolean {
  if (!accept) return false;
  const parts = accept.split(",").map((t) => t.trim().toLowerCase());
  const hasJson = parts.some((t) => t.includes("application/json"));
  const hasSse = parts.some((t) => t.includes("text/event-stream"));
  return hasJson && hasSse;
}

function sendSseResponse(
  res: Response,
  sessionId: string | undefined,
  response: MCPResponse
): void {
  const payload = JSON.stringify(response);
  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  if (sessionId) headers[MCP_SESSION_ID_HEADER] = sessionId;

  res.writeHead(200, headers);
  res.write(`data: ${payload}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
}

function sendError(res: Response, status: number, body: string): void {
  res.status(status).type("application/json").send(body);
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
  const accept = req.headers["accept"] as string | undefined;
  const sessionId = req.headers[MCP_SESSION_ID_HEADER] as string | undefined;

  if (!validateAcceptHeader(accept)) {
    return sendError(
      res,
      406,
      JSON.stringify({
        jsonrpc: "2.0",
        id: "server-error",
        error: {
          code: -32600,
          message: "Client must accept both application/json and text/event-stream",
        },
      })
    );
  }

  const request = req.body as MCPRequest;

  // Handle initialize (no session required)
  if (request.method === "initialize") {
    const { response, sessionId: newSessionId } = mcpServer.handleInitialize(request);
    return sendSseResponse(res, newSessionId, response);
  }

  // All other methods require a session
  if (!sessionId) {
    return sendError(
      res,
      400,
      JSON.stringify({
        jsonrpc: "2.0",
        id: "server-error",
        error: { code: -32600, message: "Missing session ID" },
      })
    );
  }

  const session = mcpServer.getSession(sessionId);
  if (!session) {
    return sendError(res, 400, "No valid session ID provided");
  }

  // Handle notifications/initialized
  if (request.method === "notifications/initialized") {
    session.readyForOperation = true;
    res.status(202).set(MCP_SESSION_ID_HEADER, session.sessionId).end();
    return;
  }

  if (!session.readyForOperation) {
    return sendError(
      res,
      400,
      JSON.stringify({
        jsonrpc: "2.0",
        id: "server-error",
        error: { code: -32600, message: "Session not ready" },
      })
    );
  }

  let response: MCPResponse;
  if (request.method === "tools/list") {
    response = mcpServer.handleToolsList(request);
  } else if (request.method === "tools/call") {
    response = await mcpServer.handleToolsCall(request);
  } else {
    response = {
      jsonrpc: "2.0",
      id: request.id,
      result: null,
      error: { code: -32602, message: `Method '${request.method}' not found` },
    };
  }

  sendSseResponse(res, sessionId, response);
});

app.listen(PORT, () => {
  console.log(`Custom MCP server running on http://localhost:${PORT}/mcp`);
});
