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
    //   1. Log the startup message via `this._startupMessage(command, args)` (helper above)
    //   2. Create: this.transport = new StdioClientTransport({ command, args, env: this.options.env })
    //   3. Log: "Initializing MCP session..."
    //   4. Call: await this.client.connect(this.transport)
    //   5. Log: `Connected via stdio to: ${command} ${args.join(" ")}`
    //   6. Log the negotiated init result so you can inspect server capabilities.
    //      Compose it from the SDK accessors:
    //        - this.client.getServerVersion()       (server name/version object)
    //        - this.client.getServerCapabilities()  (tools/resources/prompts capabilities)
    //        - this.client.getInstructions()        (optional usage hints)
    //      Example:
    //        console.log("Capabilities:");
    //        console.log(JSON.stringify({
    //          serverInfo: this.client.getServerVersion() ?? null,
    //          capabilities: this.client.getServerCapabilities() ?? null,
    //          instructions: this.client.getInstructions() ?? null,
    //        }, null, 2));
    throw new Error("Not implemented");
  }

  async disconnect(): Promise<void> {
    // TODO: Call await this.client.close()
    throw new Error("Not implemented");
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}
