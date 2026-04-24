export interface ContainerInfo {
  container_id: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
  session_info?: ContainerInfo;
}
