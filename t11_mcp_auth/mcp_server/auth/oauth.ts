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
  //TODO:
  // Lazy-initialize _jwks: if null, create with createRemoteJWKSet(JWKS_URL)
  // Return _jwks
  throw new Error("Not implemented.");
}

// ==================== MIDDLEWARE ====================

export async function checkOAuth(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
  //TODO:
  // 1. Get auth header = req.headers["authorization"]; if missing or not starting with "Bearer ",
  //    send 401 JSON { error: "Unauthorized", detail: "Missing or malformed Authorization header" } and return false
  // 2. Extract token = header.replace("Bearer ", "").trim()
  // 3. Try: call await jwtVerify(token, getJwks(), { issuer: ISSUER })
  //    Catch JWTError as e: send 401 JSON { error: "Unauthorized", detail: `Invalid token: ${e}` } and return false
  // 4. Extract realm roles: (payload as any).realm_access?.roles ?? []  (type: string[])
  // 5. If REQUIRED_ROLE not in roles: send 403 JSON
  //    { error: "Forbidden", detail: `Role '${REQUIRED_ROLE}' is required. User has roles: ${roles}` } and return false
  // 6. Print `✅ Authenticated: ${payload.preferred_username} | roles: ${roles}` and return true
  throw new Error("Not implemented.");
}
