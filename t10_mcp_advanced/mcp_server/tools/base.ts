export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export abstract class BaseTool {
  abstract get name(): string;
  abstract get description(): string;
  abstract get inputSchema(): Record<string, unknown>;

  abstract execute(arguments_: Record<string, unknown>): Promise<string>;

  toMcpTool(): McpTool {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    };
  }
}
