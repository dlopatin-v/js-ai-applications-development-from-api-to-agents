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

  async connect(): Promise<void> {
    // TODO: Resolve the command and args to run:
    //   If this.options.dockerImage is set:
    //     command = "docker", args = ["run", "--rm", "-i", this.options.dockerImage]
    //   Else if this.options.command is set:
    //     command = this.options.command, args = this.options.args ?? []
    //   Else throw: new Error("StdioMCPClient requires either dockerImage or command")
    //
    //   Create: this.transport = new StdioClientTransport({ command, args, env: this.options.env })
    //   Call: await this.client.connect(this.transport)
    //   Log: `Connected via stdio to: ${command} ${args.join(" ")}`
    throw new Error("Not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO: Call await this.client.close() to close the connection.
    throw new Error("Not implemented");
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}
