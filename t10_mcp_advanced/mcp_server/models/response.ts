export interface ErrorResponse {
  code: number;
  message: string;
  data?: Record<string, any> | null;
}

export interface ContentItem {
  type: string;
  text: string;
}

export interface MCPResponse {
  jsonrpc: string;
  id: string | number | null;
  result?: Record<string, any> | null;
  error?: ErrorResponse | null;
}

export function createResponse(
  id: string | number | null,
  result?: Record<string, any>,
  error?: ErrorResponse
): MCPResponse {
  return { jsonrpc: "2.0", id, result: result ?? null, error: error ?? null };
}
