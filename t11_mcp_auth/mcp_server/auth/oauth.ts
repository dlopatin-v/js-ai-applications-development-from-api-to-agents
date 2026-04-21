import { Request, Response } from "express";
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
  if (!_jwks) {
    console.log(`Fetching JWKS from ${JWKS_URL}`);
    _jwks = createRemoteJWKSet(JWKS_URL);
  }
  return _jwks;
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
export async function checkOAuth(req: Request, res: Response): Promise<boolean> {
  const authHeader = req.headers["authorization"] ?? "";

  // ── Step 1: Check header presence ──────────────────────────────
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", detail: "Missing or malformed Authorization header" });
    return false;
  }

  const token = authHeader.slice("Bearer ".length);

  // ── Step 2: Validate JWT signature + claims ─────────────────────
  let payload: JWTPayload;
  try {
    const jwks = getJwks();
    const result = await jwtVerify(token, jwks, {
      issuer: ISSUER,
    });
    payload = result.payload;
  } catch (err) {
    res.status(401).json({ error: "Unauthorized", detail: `Invalid token: ${err}` });
    return false;
  }

  // ── Step 3: Check realm role ────────────────────────────────────
  // Keycloak embeds roles in: payload.realm_access.roles
  const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
  const realmRoles: string[] = realmAccess?.roles ?? [];

  if (!realmRoles.includes(REQUIRED_ROLE)) {
    res.status(403).json({
      error: "Forbidden",
      detail: `Role '${REQUIRED_ROLE}' is required. User has roles: ${JSON.stringify(realmRoles)}`,
    });
    return false;
  }

  const username = payload.preferred_username;
  console.log(`Authenticated: ${username} | roles: ${JSON.stringify(realmRoles)}`);
  return true;
}
