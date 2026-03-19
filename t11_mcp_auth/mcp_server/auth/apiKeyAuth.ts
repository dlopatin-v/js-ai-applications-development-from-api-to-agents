import * as http from "http";

export const API_KEY = "dev-secret-key";

/**
 * API Key authentication check.
 * Returns true if the request contains a valid X-API-Key header.
 * Sends a 401 JSON response and returns false if the key is missing or invalid.
 * @param req - The incoming HTTP request.
 * @param res - The HTTP server response used to send the 401 error.
 * @returns true if the X-API-Key header matches API_KEY; false otherwise.
 * Hint: read req.headers["x-api-key"]; compare to API_KEY; write 401 JSON on mismatch.
 */
export function checkApiKey(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  // TODO
}
