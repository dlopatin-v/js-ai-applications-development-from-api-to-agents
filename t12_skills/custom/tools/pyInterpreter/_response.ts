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
