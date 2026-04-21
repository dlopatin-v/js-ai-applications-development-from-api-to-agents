export interface MCPRequest {
  jsonrpc: string;
  id: string | number | null;
  method: string;
  params?: Record<string, unknown> | null;
}
