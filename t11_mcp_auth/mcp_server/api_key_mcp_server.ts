import * as http from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from "./_server.js";
import { checkApiKey } from "./auth/api_key_auth.js";

const PORT = 8007;

// TODO:
// 1. Create a StreamableHTTPServerTransport
// 2. Create an HTTP server that:
//    - Runs checkApiKey(req, res) — if it returns false, return early (request rejected)
//    - Otherwise reads the request body and calls transport.handleRequest()
// 3. Connect the MCP server to the transport
// 4. Start listening on PORT and log the server URL
