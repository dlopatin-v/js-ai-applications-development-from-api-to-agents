import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

import { createServer } from "./_server";
import { checkOAuth } from "./auth/oauth";

const PORT = 8008;

const app = express();
app.use(express.json());

app.all("/mcp", async (req, res) => {
  const authorised = await checkOAuth(req, res);
  if (!authorised) return;
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("finish", () => transport.close());
  await createServer().connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OAuth MCP HTTP server running on http://0.0.0.0:${PORT}/mcp`);
});
