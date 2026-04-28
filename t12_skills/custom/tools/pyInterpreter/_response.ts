export interface SessionInfo {
  session_id: string;
  instructions?: string;
}

export interface FileReference {
  uri: string;
  mime_type: string;
  name: string;
  size: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string[];
  result?: string;
  error?: string;
  traceback: string[];
  files: FileReference[];
  session_info?: SessionInfo;
}

export function normalizeExecutionResult(raw: unknown): ExecutionResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    success: Boolean(r.success),
    output: Array.isArray(r.output) ? (r.output as string[]) : [],
    result: (r.result as string | undefined) ?? undefined,
    error: (r.error as string | undefined) ?? undefined,
    traceback: Array.isArray(r.traceback) ? (r.traceback as string[]) : [],
    files: Array.isArray(r.files) ? (r.files as FileReference[]) : [],
    session_info: (r.session_info as SessionInfo | undefined) ?? undefined,
  };
}
