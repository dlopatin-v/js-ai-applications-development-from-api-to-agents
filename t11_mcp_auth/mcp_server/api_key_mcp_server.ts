import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./_server.js";
import { checkApiKey } from "./auth/api_key_auth.js";

const PORT = 8007;

//TODO:
// 1. Create an express app and register express.json() middleware
// 2. Register app.all("/mcp", ...) handler that:
//       - Calls checkApiKey(req, res); if it returns false, return immediately
//       - Creates a new StreamableHTTPServerTransport with sessionIdGenerator: undefined
//       - Registers res.on("finish", ...) to close the transport when the response ends
//       - Connects a new MCP server instance to the transport: await createServer().connect(transport)
//       - Handles the request: await transport.handleRequest(req, res, req.body)
// 3. Start the app on PORT and log:
//    `API Key MCP HTTP server running on http://0.0.0.0:${PORT}/mcp`
