import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./_server.js";
import { checkApiKey } from "./auth/apiKeyAuth.js";

const PORT = 8007;

const app = express();
app.use(express.json());

app.all("/mcp", async (req, res) => {
  if (!checkApiKey(req, res)) return;
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("finish", () => transport.close());
  await createServer().connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Key MCP HTTP server running on http://0.0.0.0:${PORT}/mcp`);
});
