import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { server } from "./_server.js";

const PORT = 8005;

const app = express();
app.use(express.json());

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

app.all("/mcp", async (req, res) => {
  await transport.handleRequest(req, res, req.body);
});

server.connect(transport);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP HTTP server running on http://0.0.0.0:${PORT}/mcp`);
});
