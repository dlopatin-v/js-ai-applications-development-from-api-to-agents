import * as crypto from "crypto";
import * as http from "http";
import { exec } from "child_process";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { T11MCPClient } from "./_base.js";

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
  //TODO:
  // 1. Generate codeVerifier = crypto.randomBytes(32).toString("base64url")
  // 2. Generate codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url")
  // 3. Return { codeVerifier, codeChallenge }
  throw new Error("Not implemented.");
}

function buildAuthUrl(codeChallenge: string, state: string): string {
  //TODO:
  // Build URLSearchParams with: response_type="code", client_id=CLIENT_ID, redirect_uri=REDIRECT_URI,
  //   scope="openid", state, code_challenge=codeChallenge, code_challenge_method="S256"
  // Return `${AUTH_ENDPOINT}?${params}`
  throw new Error("Not implemented.");
}

// ==================== LOCAL CALLBACK SERVER ====================

function waitForCallback(): Promise<{ code: string; state: string }> {
  //TODO:
  // Start a temporary http.createServer on REDIRECT_PORT
  // Parse req.url to extract `code` and `state` query params
  // Send a success HTML response, close the server, and resolve the promise with { code, state }
  throw new Error("Not implemented.");
}

function openBrowser(url: string): void {
  //TODO:
  // Use exec() to open the URL in the default browser:
  //   macOS: "open <url>", Linux: "xdg-open <url>", Windows: "start <url>"
  throw new Error("Not implemented.");
}

// ==================== TOKEN EXCHANGE ====================

async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<Record<string, unknown>> {
  //TODO:
  // POST to TOKEN_ENDPOINT with application/x-www-form-urlencoded body:
  //   grant_type="authorization_code", code, redirect_uri=REDIRECT_URI,
  //   client_id=CLIENT_ID, code_verifier=codeVerifier
  // Return the parsed JSON response
  throw new Error("Not implemented.");
}

async function refreshAccessToken(refreshToken: string): Promise<Record<string, unknown>> {
  //TODO:
  // POST to TOKEN_ENDPOINT with: grant_type="refresh_token", refresh_token=refreshToken, client_id=CLIENT_ID
  // Return the parsed JSON response
  throw new Error("Not implemented.");
}

// ==================== OAUTH TOKEN MANAGER ====================

class OAuthTokenManager {
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _expiresAt: number | null = null;

  async authenticate(): Promise<void> {
    //TODO:
    // 1. Generate PKCE pair: { codeVerifier, codeChallenge } = generatePkcePair()
    // 2. Generate state = crypto.randomBytes(16).toString("hex")
    // 3. Build auth URL: buildAuthUrl(codeChallenge, state)
    // 4. Open browser with openBrowser(authUrl)
    // 5. Wait for callback: { code } = await waitForCallback()
    // 6. Exchange code: tokens = await exchangeCodeForTokens(code, codeVerifier)
    // 7. Store tokens: this._storeTokens(tokens)
    throw new Error("Not implemented.");
  }

  private _storeTokens(tokens: Record<string, unknown>): void {
    //TODO:
    // 1. Set this._accessToken = tokens["access_token"] as string
    // 2. Set this._refreshToken = tokens["refresh_token"] as string
    // 3. Set this._expiresAt = Date.now() + ((tokens["expires_in"] as number) * 1000) - 10000
    throw new Error("Not implemented.");
  }

  isTokenExpired(): boolean {
    //TODO:
    // Return true if _expiresAt is null or Date.now() >= _expiresAt
    throw new Error("Not implemented.");
  }

  async refresh(): Promise<void> {
    //TODO:
    // 1. Call refreshAccessToken(this._refreshToken!)
    // 2. Store the result with _storeTokens
  }

  authHeaders(): Record<string, string> {
    //TODO:
    // Return { Authorization: `Bearer ${this._accessToken}` }
    throw new Error("Not implemented.");
  }
}

// ==================== OAUTH MCP CLIENT ====================

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
    //TODO:
    // 1. Await this.tokenManager.authenticate() to run the PKCE browser flow
    // 2. Await this._connectWithCurrentToken()
    throw new Error("Not implemented.");
  }

  private async _connectWithCurrentToken(): Promise<void> {
    //TODO:
    // 1. Create a new Client({ name: "oauth-mcp-client", version: "1.0.0" }), assign to this.client
    // 2. Create StreamableHTTPClientTransport with a custom fetch that injects
    //    this.tokenManager.authHeaders() into every request's headers; assign to this.transport
    // 3. Call await this.client.connect(this.transport)
    // 4. Log: `Connected to OAuth MCP server at ${this.serverUrl}`
    throw new Error("Not implemented.");
  }

  async disconnect(): Promise<void> {
    //TODO:
    // Call await this.transport?.close()
    throw new Error("Not implemented.");
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    //TODO:
    // 1. If this.transport is null, throw Error("MCP client not connected")
    // 2. Print `    🔧 Calling \`${toolName}\` with ${JSON.stringify(toolArgs)}`
    // 3. If this.tokenManager.isTokenExpired():
    //       - Print "    🔄 Token expired — refreshing and reconnecting..."
    //       - Await this._reconnectWithFreshToken()
    // 4. Return await this._doCallTool(toolName, toolArgs)
    throw new Error("Not implemented.");
  }

  private async _doCallTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    //TODO:
    // Delegate to super.callTool(toolName, toolArgs) and return the result
    throw new Error("Not implemented.");
  }

  private async _reconnectWithFreshToken(): Promise<void> {
    //TODO:
    // 1. Await this.tokenManager.refresh()
    // 2. Await this._connectWithCurrentToken()
    // 3. Log: "Reconnected with fresh token"
    throw new Error("Not implemented.");
  }
}
