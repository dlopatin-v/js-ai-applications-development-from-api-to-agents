import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./_server";

async function main() {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
}

main().catch(console.error);
