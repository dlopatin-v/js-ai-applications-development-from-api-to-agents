import * as http from "http";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

// ==================== CONFIGURATION ====================

const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8089";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? "mcp-realm";
const REQUIRED_ROLE = process.env.MCP_REQUIRED_ROLE ?? "mcp-tools-access";

const ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
const JWKS_URL = new URL(`${ISSUER}/protocol/openid-connect/certs`);

// ==================== JWKS CACHE ====================

// Public keys are fetched once from Keycloak and cached in memory.
// This avoids a round-trip to Keycloak on every MCP request.
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  // TODO:
  // 1. If _jwks is null — create it with createRemoteJWKSet(JWKS_URL) and store in _jwks
  //    Log "🔑 Fetching JWKS from ..." before and "🔑 JWKS cached successfully" after
  // 2. Return _jwks
  throw new Error("Not implemented");
}

// ==================== MIDDLEWARE ====================

/**
 * JWT/OAuth authentication check.
 *   1. Extracts the Bearer token from the Authorization header
 *   2. Validates JWT signature using Keycloak public keys (JWKS)
 *   3. Verifies token issuer and expiry
 *   4. Checks that the user has the required realm role
 *
 * Returns true if authenticated and authorised.
 * Sends a 401/403 JSON response and returns false otherwise.
 */
export async function checkOAuth(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
  const authHeader = req.headers["authorization"] ?? "";

  // ── Step 1: Check header presence ──────────────────────────────
  // TODO: If authHeader doesn't start with "Bearer " — write a 401 JSON response and return false

  const token = authHeader.replace(/^Bearer /, "");

  // ── Step 2: Validate JWT signature + claims ─────────────────────
  // TODO:
  // 1. Call getJwks() to get the cached JWKS
  // 2. Verify the token with jwtVerify(token, jwks, { issuer: ISSUER })
  //    Wrap in try/catch — on failure write a 401 JSON response and return false

  // ── Step 3: Check realm role ────────────────────────────────────
  // Keycloak embeds roles in: payload.realm_access.roles
  // TODO:
  // 1. Extract the realm roles array from the decoded JWT payload
  // 2. If REQUIRED_ROLE is not present — write a 403 JSON response listing the user's roles
  //    and return false
  // 3. Log the authenticated username and their roles, then return true
  throw new Error("Not implemented");
}
