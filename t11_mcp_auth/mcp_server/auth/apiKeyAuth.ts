import * as http from "http";

export const API_KEY = "dev-secret-key";

/**
 * API Key authentication check.
 * Returns true if the request contains a valid X-API-Key header.
 * Sends a 401 JSON response and returns false if the key is missing or invalid.
 */
export function checkApiKey(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  // TODO
}
