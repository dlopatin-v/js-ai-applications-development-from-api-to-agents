import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./_server";
import { checkOAuth } from "./auth/oauth";

const PORT = 8008;

// TODO:
// 1. Create a StreamableHTTPServerTransport
// 2. Create an HTTP server that:
//    - Runs await checkOAuth(req, res) — if it returns false, return early (request rejected)
//    - Otherwise reads the request body and calls transport.handleRequest()
// 3. Connect the MCP server to the transport
// 4. Start listening on PORT and log the server URL
