import { exec } from "child_process";
import * as crypto from "crypto";
import * as http from "http";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { T11MCPClient } from "./_base";

// ==================== KEYCLOAK CONFIGURATION ====================

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8089";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? "mcp-realm";
const CLIENT_ID = process.env.MCP_CLIENT_ID ?? "mcp-client";

const REDIRECT_PORT = 9999;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

const _BASE = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect`;
const AUTH_ENDPOINT = `${_BASE}/auth`;
const TOKEN_ENDPOINT = `${_BASE}/token`;

// ==================== PKCE HELPERS ====================

function generatePkcePair(): { codeVerifier: string; codeChallenge: string } {
  // TODO:
  // 1. Generate a random codeVerifier: crypto.randomBytes(64).toString("base64url")
  // 2. Derive codeChallenge: SHA-256 hash of codeVerifier, output as base64url
  //    crypto.createHash("sha256").update(codeVerifier).digest().toString("base64url")
  // 3. Return { codeVerifier, codeChallenge }
  throw new Error("Not implemented");
}

function buildAuthUrl(codeChallenge: string, state: string): string {
  // TODO:
  // 1. Build URLSearchParams with:
  //    response_type: "code", client_id: CLIENT_ID, redirect_uri: REDIRECT_URI,
  //    scope: "openid profile", state, code_challenge: codeChallenge,
  //    code_challenge_method: "S256"
  // 2. Return `${AUTH_ENDPOINT}?${params.toString()}`
  throw new Error("Not implemented");
}

// ==================== LOCAL CALLBACK SERVER ====================

function waitForCallback(): Promise<{ code: string; state: string }> {
  // TODO:
  // 1. Return a new Promise that spins up a local http.createServer on REDIRECT_PORT
  // 2. In the request handler:
  //    a. Parse the request URL; only handle pathname === "/callback"
  //    b. Extract code, state, error from searchParams
  //    c. Send a 200 HTML response — success message if code present, error message otherwise
  //    d. Call server.close()
  //    e. reject() on error or missing code/state; resolve({ code, state }) on success
  // 3. Call server.listen(REDIRECT_PORT, "localhost")
  throw new Error("Not implemented");
}

function openBrowser(url: string): void {
  // TODO:
  // 1. Detect process.platform: "darwin" → `open`, "win32" → `start ""`, else `xdg-open`
  // 2. Call exec(cmd) to launch the browser
}

// ==================== TOKEN EXCHANGE ====================

async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<Record<string, unknown>> {
  // TODO:
  // 1. Build URLSearchParams body with:
  //    grant_type: "authorization_code", client_id: CLIENT_ID,
  //    redirect_uri: REDIRECT_URI, code, code_verifier: codeVerifier
  // 2. POST to TOKEN_ENDPOINT with Content-Type: application/x-www-form-urlencoded
  // 3. If !response.ok — throw an Error with status + response text
  // 4. Return response.json() as Promise<Record<string, unknown>>
  throw new Error("Not implemented");
}

async function refreshAccessToken(refreshToken: string): Promise<Record<string, unknown>> {
  // TODO:
  // 1. Build URLSearchParams body with:
  //    grant_type: "refresh_token", client_id: CLIENT_ID, refresh_token: refreshToken
  // 2. POST to TOKEN_ENDPOINT with Content-Type: application/x-www-form-urlencoded
  // 3. If !response.ok — throw an Error with status + response text
  // 4. Return response.json() as Promise<Record<string, unknown>>
  throw new Error("Not implemented");
}

// ==================== OAUTH TOKEN MANAGER ====================

class OAuthTokenManager {
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _expiresAt: number | null = null;

  async authenticate(): Promise<void> {
    // TODO:
    // 1. Call generatePkcePair() to get { codeVerifier, codeChallenge }
    // 2. Generate a random state: crypto.randomBytes(16).toString("base64url")
    // 3. Start waitForCallback() (do NOT await yet — store the Promise)
    // 4. Build the auth URL via buildAuthUrl(codeChallenge, state)
    // 5. Log the URL, then call openBrowser(authUrl)
    // 6. Await the callback with a 120-second timeout (Promise.race):
    //    if timeout fires — throw Error("OAuth callback not received within 120 seconds")
    // 7. Verify returnedState === state; if not — throw CSRF mismatch error
    // 8. Call exchangeCodeForTokens(code, codeVerifier) and pass result to _storeTokens()
    // 9. Log success message with expires_in value
    throw new Error("Not implemented");
  }

  private _storeTokens(tokens: Record<string, unknown>): void {
    // TODO:
    // 1. Store tokens["access_token"] as string in this._accessToken
    // 2. Store tokens["refresh_token"] as string (or null) in this._refreshToken
    // 3. Compute this._expiresAt = Date.now() + (expiresIn - 30) * 1000
    //    where expiresIn = (tokens["expires_in"] as number) ?? 300
    //    (subtract 30s as a safety buffer before the actual expiry)
  }

  isTokenExpired(): boolean {
    // TODO:
    // 1. Return true if this._expiresAt is null or Date.now() >= this._expiresAt
    throw new Error("Not implemented");
  }

  async refresh(): Promise<void> {
    // TODO:
    // 1. If this._refreshToken is null — throw Error("No refresh token available")
    // 2. Call refreshAccessToken(this._refreshToken) and pass result to _storeTokens()
    // 3. Log that the token was refreshed
    throw new Error("Not implemented");
  }

  authHeaders(): Record<string, string> {
    // TODO:
    // 1. If this._accessToken is null — throw Error("Not authenticated")
    // 2. Return { Authorization: `Bearer ${this._accessToken}` }
    throw new Error("Not implemented");
  }
}

// ==================== OAUTH MCP CLIENT ====================

/**
 * MCP client that authenticates via OAuth 2.0 + PKCE (Keycloak).
 *
 * On connect():
 *   1. Runs the PKCE browser flow (opens Keycloak login once)
 *   2. Connects to the MCP server with the resulting Bearer token
 *
 * On callTool():
 *   - Automatically refreshes the token and reconnects if token is expired
 */
export class OauthMCPClient extends T11MCPClient {
  private readonly serverUrl: string;
  private readonly tokenManager: OAuthTokenManager;
  private transport: StreamableHTTPClientTransport | null = null;

  constructor(serverUrl: string) {
    super("oauth-mcp-client");
    this.serverUrl = serverUrl;
    this.tokenManager = new OAuthTokenManager();
  }

  async connect(): Promise<void> {
    // TODO:
    // Step 1: Authenticate via browser PKCE flow
    //   await this.tokenManager.authenticate()
    // Step 2: Connect MCP session with the resulting Bearer token
    //   await this._connectWithCurrentToken()
    throw new Error("Not implemented");
  }

  private async _connectWithCurrentToken(): Promise<void> {
    // TODO:
    // 1. Get auth headers from this.tokenManager.authHeaders()
    // 2. Create a new StreamableHTTPClientTransport for this.serverUrl
    //    Pass requestInit: { headers } so the Bearer token is sent on every request
    // 3. Assign it to this.transport
    // 4. Replace this.client with a fresh Client instance (name: "oauth-mcp-client", version: "1.0.0")
    //    (needed to get a clean connection when reconnecting after token refresh)
    // 5. await this.client.connect(this.transport)
    // 6. Log server capabilities via this.client.getServerCapabilities()
    throw new Error("Not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO:
    // 1. await this.client.close()
    // 2. Set this.transport = null
    throw new Error("Not implemented");
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    // TODO:
    // 1. Log the tool name and args
    // 2. Check this.tokenManager.isTokenExpired() — if true, call this._reconnectWithFreshToken()
    // 3. Return await this._doCallTool(toolName, toolArgs)
    throw new Error("Not implemented");
  }

  private async _doCallTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    // TODO:
    // 1. Call this.client.callTool({ name: toolName, arguments: toolArgs })
    //    Cast result to { content: { type: string; text?: string }[] }
    // 2. Take content[0]
    // 3. Log the content
    // 4. If content has a "text" property — return content.text
    // 5. Otherwise return content
    throw new Error("Not implemented");
  }

  private async _reconnectWithFreshToken(): Promise<void> {
    // TODO:
    // 1. Call await this.tokenManager.refresh() to get a new access token
    // 2. Close the existing client: await this.client.close()
    // 3. Re-establish the MCP session: await this._connectWithCurrentToken()
    // 4. Log that reconnection succeeded
    throw new Error("Not implemented");
  }
}
