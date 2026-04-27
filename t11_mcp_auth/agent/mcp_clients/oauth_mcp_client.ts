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
  const codeVerifier = crypto.randomBytes(64).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest()
    .toString("base64url");
  return { codeVerifier, codeChallenge };
}

function buildAuthUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "openid profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

// ==================== LOCAL CALLBACK SERVER ====================

function waitForCallback(): Promise<{ code: string; state: string }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${REDIRECT_PORT}`);
      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end();
        return;
      }

      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      res.writeHead(200, { "Content-Type": "text/html" });
      if (code) {
        res.end(`
          <html><body style="font-family:monospace;background:#0a0c10;color:#34d399;
                             display:flex;align-items:center;justify-content:center;
                             height:100vh;margin:0;font-size:18px;">
            <div>&#10003; Authentication successful. You can close this tab.</div>
          </body></html>
        `);
      } else {
        res.end(`
          <html><body style="font-family:monospace;background:#0a0c10;color:#f87171;
                             display:flex;align-items:center;justify-content:center;
                             height:100vh;margin:0;font-size:18px;">
            <div>&#10007; Authentication failed. Check terminal for details.</div>
          </body></html>
        `);
      }

      server.close();

      if (error) {
        reject(new Error(`OAuth error from Keycloak: ${error}`));
      } else if (!code || !state) {
        reject(new Error("No authorization code received in callback"));
      } else {
        resolve({ code, state });
      }
    });

    server.listen(REDIRECT_PORT, "localhost");
  });
}

function openBrowser(url: string): void {
  const platform = process.platform;
  let cmd: string;
  if (platform === "darwin") cmd = `open "${url}"`;
  else if (platform === "win32") cmd = `start "" "${url}"`;
  else cmd = `xdg-open "${url}"`;
  exec(cmd);
}

// ==================== TOKEN EXCHANGE ====================

async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code,
    code_verifier: codeVerifier,
  });
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
  return response.json() as Promise<Record<string, unknown>>;
}

async function refreshAccessToken(refreshToken: string): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
  });
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) throw new Error(`Token refresh failed: ${response.status} ${await response.text()}`);
  return response.json() as Promise<Record<string, unknown>>;
}

// ==================== OAUTH TOKEN MANAGER ====================

class OAuthTokenManager {
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _expiresAt: number | null = null;

  async authenticate(): Promise<void> {
    const { codeVerifier, codeChallenge } = generatePkcePair();
    const state = crypto.randomBytes(16).toString("base64url");

    const callbackPromise = waitForCallback();

    const authUrl = buildAuthUrl(codeChallenge, state);
    console.log("\n🌐 Opening browser for Keycloak login...");
    console.log(`   URL: ${authUrl}\n`);
    openBrowser(authUrl);

    console.log(`⏳ Waiting for authentication callback on http://localhost:${REDIRECT_PORT}/callback ...`);

    const { code, state: returnedState } = await Promise.race([
      callbackPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OAuth callback not received within 120 seconds")), 120_000)
      ),
    ]);

    if (returnedState !== state) {
      throw new Error("OAuth state mismatch — possible CSRF attack");
    }

    console.log("🔄 Exchanging authorization code for tokens...");
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    this._storeTokens(tokens);
    console.log(`✅ Authenticated! Token expires in ${tokens["expires_in"]}s\n`);
  }

  private _storeTokens(tokens: Record<string, unknown>): void {
    this._accessToken = tokens["access_token"] as string;
    this._refreshToken = (tokens["refresh_token"] as string) ?? null;
    const expiresIn = (tokens["expires_in"] as number) ?? 300;
    this._expiresAt = Date.now() + (expiresIn - 30) * 1000;
  }

  isTokenExpired(): boolean {
    return this._expiresAt === null || Date.now() >= this._expiresAt;
  }

  async refresh(): Promise<void> {
    if (!this._refreshToken) {
      throw new Error("No refresh token available — re-authentication required");
    }
    console.log("🔄 Refreshing access token...");
    const tokens = await refreshAccessToken(this._refreshToken);
    this._storeTokens(tokens);
    console.log("✅ Token refreshed");
  }

  authHeaders(): Record<string, string> {
    if (!this._accessToken) {
      throw new Error("Not authenticated — call authenticate() first");
    }
    return { Authorization: `Bearer ${this._accessToken}` };
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
    // Step 1: Authenticate via browser PKCE flow
    await this.tokenManager.authenticate();

    // Step 2: Connect MCP session with Bearer token
    await this._connectWithCurrentToken();
  }

  private async _connectWithCurrentToken(): Promise<void> {
    const headers = this.tokenManager.authHeaders();
    this.transport = new StreamableHTTPClientTransport(new URL(this.serverUrl), {
      requestInit: { headers },
    });
    // Replace the client instance to get a clean connection
    this.client = new Client({
      name: "oauth-mcp-client",
      version: "1.0.0",
    });
    await this.client.connect(this.transport);
    const caps = this.client.getServerCapabilities();
    console.log("Connected (OAuth). Server capabilities:", JSON.stringify(caps));
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    this.transport = null;
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    console.log(`    Calling \`${toolName}\` with`, toolArgs);

    if (this.tokenManager.isTokenExpired()) {
      console.log("    🔄 Token expired — refreshing and reconnecting...");
      await this._reconnectWithFreshToken();
    }

    return this._doCallTool(toolName, toolArgs);
  }

  private async _doCallTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    const result = await this.client.callTool({ name: toolName, arguments: toolArgs }) as { content: { type: string; text?: string }[] };
    const content = result.content[0];
    console.log(`    ⚙️:`, content, "\n");
    if (content && "text" in content) return content.text;
    return content;
  }

  private async _reconnectWithFreshToken(): Promise<void> {
    await this.tokenManager.refresh();
    await this.client.close();
    await this._connectWithCurrentToken();
    console.log("    ✅ Reconnected with fresh token");
  }
}
