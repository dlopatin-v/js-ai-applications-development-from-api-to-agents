import * as http from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "./_server.js";
import { checkOAuth } from "./auth/oauth.js";

const PORT = 8008;

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

const httpServer = http.createServer(async (req, res) => {
  const authorised = await checkOAuth(req, res);
  if (!authorised) return;
  await transport.handleRequest(req, res, await readBody(req));
});

server.connect(transport);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`OAuth MCP HTTP server running on http://0.0.0.0:${PORT}/mcp`);
});

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : undefined);
      } catch {
        resolve(undefined);
      }
    });
    req.on("error", reject);
  });
}
