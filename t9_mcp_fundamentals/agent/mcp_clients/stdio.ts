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
    // TODO: Resolve the command and args to run:
    //   If this.options.dockerImage is set:
    //     command = "docker", args = ["run", "--rm", "-i", this.options.dockerImage]
    //   Else if this.options.command is set:
    //     command = this.options.command, args = this.options.args ?? []
    //   Else throw: new Error("StdioMCPClient requires either dockerImage or command")
    //
    //   Log the startup message via this._startupMessage(command, args)
    //   Create: this.transport = new StdioClientTransport({ command, args, env: this.options.env })
    //   Log: "Initializing MCP session..."
    //   Call: await this.client.connect(this.transport)
    //   Log: `Connected via stdio to: ${command} ${args.join(" ")}`
    //   Then log "Capabilities:" and dump the negotiated init result composed from:
    //     - this.client.getServerVersion()       (server name/version)
    //     - this.client.getServerCapabilities()  (tools/resources/prompts caps)
    //     - this.client.getInstructions()        (optional usage hints)
    //   e.g. console.log(JSON.stringify({ serverInfo, capabilities, instructions }, null, 2));
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
