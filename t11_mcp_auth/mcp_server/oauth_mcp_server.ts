import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

import { createServer } from "./_server";
import { checkOAuth } from "./auth/oauth";

const PORT = 8008;

//TODO:
// 1. Create an express app and register express.json() middleware
// 2. Register app.all("/mcp", ...) handler that:
//       - Calls await checkOAuth(req, res); if it returns false, return immediately
//       - Creates a new StreamableHTTPServerTransport with sessionIdGenerator: undefined
//       - Registers res.on("finish", ...) to close the transport when the response ends
//       - Connects a new MCP server instance to the transport: await createServer().connect(transport)
//       - Handles the request: await transport.handleRequest(req, res, req.body)
// 3. Start the app on PORT and log:
//    `OAuth MCP HTTP server running on http://0.0.0.0:${PORT}/mcp`
