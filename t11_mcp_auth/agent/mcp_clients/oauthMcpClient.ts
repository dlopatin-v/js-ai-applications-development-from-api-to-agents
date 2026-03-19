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

/**
 * Generates a PKCE code_verifier (random 32-byte base64url string)
 * and the corresponding code_challenge (SHA-256 hash, base64url encoded).
 * @returns Object with codeVerifier and codeChallenge strings.
 * Hint: crypto.randomBytes(32).toString("base64url") for verifier;
 * crypto.createHash("sha256").update(verifier).digest("base64url") for challenge.
 */
function generatePkcePair(): { codeVerifier: string; codeChallenge: string } {
  // TODO
}

/**
 * Builds the Keycloak authorization URL for the PKCE flow.
 * @param codeChallenge - The PKCE code_challenge string.
 * @param state - A random state parameter for CSRF protection.
 * @returns The full authorization URL as a string.
 * Hint: URLSearchParams with response_type, client_id, redirect_uri,
 * scope, state, code_challenge, code_challenge_method=S256.
 */
function buildAuthUrl(codeChallenge: string, state: string): string {
  // TODO
}

// ==================== LOCAL CALLBACK SERVER ====================

/**
 * Starts a temporary HTTP server on REDIRECT_PORT that captures the OAuth callback.
 * @returns Promise resolving to { code, state } extracted from the callback query string.
 * Hint: create an http.createServer that parses req.url, resolves the promise, then
 * sends a success HTML response and closes the server.
 */
function waitForCallback(): Promise<{ code: string; state: string }> {
  // TODO
}

/**
 * Opens the given URL in the system's default browser.
 * @param url - The URL to open.
 * Hint: use exec("open <url>") on macOS, "xdg-open" on Linux, "start" on Windows.
 */
function openBrowser(url: string): void {
  // TODO
}

// ==================== TOKEN EXCHANGE ====================

/**
 * Exchanges the authorization code for access and refresh tokens at Keycloak.
 * @param code - The authorization code received in the callback.
 * @param codeVerifier - The original PKCE code_verifier.
 * @returns The parsed token response object (access_token, refresh_token, expires_in, etc.).
 * Hint: POST to TOKEN_ENDPOINT with grant_type=authorization_code, code, redirect_uri,
 * client_id, code_verifier as application/x-www-form-urlencoded.
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<Record<string, unknown>> {
  // TODO
}

/**
 * Refreshes the access token using the stored refresh token.
 * @param refreshToken - The refresh_token from a prior token response.
 * @returns The new token response object.
 * Hint: POST to TOKEN_ENDPOINT with grant_type=refresh_token, refresh_token, client_id.
 */
async function refreshAccessToken(refreshToken: string): Promise<Record<string, unknown>> {
  // TODO
}

// ==================== OAUTH TOKEN MANAGER ====================

class OAuthTokenManager {
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _expiresAt: number | null = null;

  /**
   * Runs the full PKCE browser flow: generates PKCE pair, opens browser, waits for callback,
   * exchanges code for tokens, then stores them.
   * Hint: generatePkcePair → buildAuthUrl → openBrowser → waitForCallback → exchangeCodeForTokens → _storeTokens.
   */
  async authenticate(): Promise<void> {
    // TODO
  }

  /**
   * Stores access_token, refresh_token, and calculates expiry from expires_in.
   * @param tokens - The token response object from Keycloak.
   * Hint: this._expiresAt = Date.now() + (expires_in * 1000) - 10000 (10s buffer).
   */
  private _storeTokens(tokens: Record<string, unknown>): void {
    // TODO
  }

  /**
   * Checks whether the stored access token has expired.
   * @returns true if the token is expired or expiry is unknown.
   */
  isTokenExpired(): boolean {
    // TODO
  }

  /**
   * Requests a new access token using the stored refresh token and updates stored tokens.
   * Hint: call refreshAccessToken(this._refreshToken!); then _storeTokens.
   */
  async refresh(): Promise<void> {
    // TODO
  }

  /**
   * Returns the Authorization header object for the current access token.
   * @returns { Authorization: "Bearer <token>" }
   */
  authHeaders(): Record<string, string> {
    // TODO
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

  /**
   * Authenticates via PKCE flow then connects to the MCP server with the Bearer token.
   * Hint: await this.tokenManager.authenticate(); then _connectWithCurrentToken().
   */
  async connect(): Promise<void> {
    // TODO
  }

  /**
   * Creates a new StreamableHTTPClientTransport with the current Bearer token injected
   * via a custom fetch wrapper, then connects this.client to the server.
   * Hint: create a new Client, build transport with fetch override merging authHeaders(),
   * then call this.client.connect(transport).
   */
  private async _connectWithCurrentToken(): Promise<void> {
    // TODO
  }

  /**
   * Closes the active transport connection.
   * Hint: call this.transport?.close().
   */
  async disconnect(): Promise<void> {
    // TODO
  }

  /**
   * Calls a tool, automatically refreshing the token and reconnecting if expired.
   * @param toolName - Name of the tool to invoke.
   * @param toolArgs - Arguments to pass to the tool.
   * @returns The tool's result value.
   * Hint: if tokenManager.isTokenExpired(), call _reconnectWithFreshToken(); then _doCallTool().
   */
  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    // TODO
  }

  /**
   * Delegates the actual tool call to the parent class implementation.
   * @param toolName - Tool name.
   * @param toolArgs - Tool arguments.
   * @returns The tool result.
   * Hint: call super.callTool(toolName, toolArgs).
   */
  private async _doCallTool(toolName: string, toolArgs: Record<string, unknown>): Promise<unknown> {
    // TODO
  }

  /**
   * Refreshes the access token and re-establishes the MCP connection.
   * Hint: await tokenManager.refresh(); then _connectWithCurrentToken().
   */
  private async _reconnectWithFreshToken(): Promise<void> {
    // TODO
  }
}
