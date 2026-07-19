import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["../mcp-server/dist/mcp/server.js"],
  env: {
    INJECTIVE_NETWORK: "testnet"
  }
});

const mcpClient = new Client({ name: "BalanceChecker", version: "1.0.0" }, { capabilities: {} });

async function main() {
  await mcpClient.connect(transport);
  console.log("Connected to MCP");
  
  const depositResult = await mcpClient.callTool({
    name: "subaccount_deposit",
    arguments: {
      address: "inj12hwzwusuejawqx2lraq4dsawsk5yvxtgfe0edx",
      password: "agentic-password",
      denom: "erc20:0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d",
      amount: "20.0",
      subaccountIndex: 1
    }
  });
  
  console.log("Deposit Result:", JSON.stringify(depositResult, null, 2));
  process.exit(0);
}

main().catch(console.error);
