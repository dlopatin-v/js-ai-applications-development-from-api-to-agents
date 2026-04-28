import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { MCPClient } from "./base";

interface StdioMCPClientOptions {
  /** Docker image to run as the MCP server (alternative to command+args) */
  dockerImage?: string;
  /** Command to run directly (alternative to dockerImage) */
  command?: string;
  /** Arguments for the command */
  args?: string[];
  /** Environment variables to pass to the subprocess */
  env?: Record<string, string>;
}

export class StdioMCPClient extends MCPClient {
  private transport: StdioClientTransport | null = null;
  private readonly options: StdioMCPClientOptions;

  constructor(options: StdioMCPClientOptions) {
    super("stdio-mcp-client");
    this.options = options;
  }

  private _startupMessage(command: string, args: string[]): string {
    if (this.options.dockerImage) {
      return (
        `Starting Docker container: ${this.options.dockerImage}\n` +
        `To inspect running containers: docker ps --filter 'ancestor=${this.options.dockerImage}'`
      );
    }
    return `Starting local stdio server: ${command} ${args.join(" ")}`;
  }

  async connect(): Promise<void> {
    let command: string;
    let args: string[];

    if (this.options.dockerImage) {
      command = "docker";
      args = ["run", "--rm", "-i", this.options.dockerImage];
    } else if (this.options.command) {
      command = this.options.command;
      args = this.options.args ?? [];
    } else {
      throw new Error("StdioMCPClient requires either dockerImage or command");
    }

    console.log(this._startupMessage(command, args));

    this.transport = new StdioClientTransport({
      command,
      args,
      env: this.options.env,
    });

    console.log("Initializing MCP session...");
    await this.client.connect(this.transport);
    console.log(`Connected via stdio to: ${command} ${args.join(" ")}`);
    console.log("Capabilities:");
    this.printInitResult();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
