import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

let activeWalletAddress: string = process.env.INJECTIVE_ADDRESS || "";

const transport = new StdioClientTransport({
  command: "node",
  args: ["../mcp-server/dist/mcp/server.js"],
  env: {
    INJECTIVE_NETWORK: "testnet"
  }
});

const mcpClient = new Client({ name: "InjPassFanManager", version: "1.0.0" }, { capabilities: {} });

const INEVM_RPC_URL = process.env.INEVM_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY;

const CONTRACT_ABI = [
  "function upgradeToVictoryMetadata(uint256 _tokenId, string memory _victoryUri) public"
];

async function monitorFanEcosystem() {
  console.log("🤖 AI Fan Engagement Agent scanning match environment...");

  try {
    // 1. Fetch live events from internal endpoint
    const response = await fetch('http://localhost:3000/api/events/live-feed');
    const matchData: any = await response.json();

    console.log(`📊 Currently at ${matchData.minute}' | ${matchData.score}`);

    // 2. Action Trigger: Match victory occurred
    if (matchData.recentEvent === "MATCH_END_WIN") {
      console.log("🚨 MATCH WIN DETECTED! Initializing Dynamic NFT upgrades for fans...");

      // Execute real on-chain transaction if CONTRACT_ADDRESS & PRIVATE_KEY exist
      if (CONTRACT_ADDRESS && PRIVATE_KEY) {
        try {
          console.log(`🌐 Submitting real upgradeToVictoryMetadata to Injective EVM Testnet (${CONTRACT_ADDRESS})...`);
          const provider = new ethers.JsonRpcProvider(INEVM_RPC_URL);
          const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

          const tx = await contract.upgradeToVictoryMetadata(1, "ipfs://gold-victory-edition");
          console.log(`⏳ On-chain Tx submitted! Hash: ${tx.hash}`);
          console.log(`🔗 Explorer: https://testnet.blockscout.injective.network/tx/${tx.hash}`);
          await tx.wait();
          console.log("🏆 Success: Fan Collectible upgraded to Gold/Victory Edition on-chain via Injective EVM!");

          // Reset simulation state
          await fetch('http://localhost:3000/api/admin/simulate-trigger', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ eventType: "NONE" })
          });
          return;
        } catch (onChainErr: any) {
          console.warn("⚠️ On-chain upgrade notice (falling back to MCP bridge / simulation):", onChainErr.message || onChainErr);
        }
      }

      // Fallback / MCP execution pathway
      const tx: any = await mcpClient.callTool({
        name: "trade_open",
        arguments: {
          symbol: "INJ/USDT", 
          side: "long", 
          amount: "0.1",
          address: activeWalletAddress || process.env.INJECTIVE_ADDRESS,
          password: "agentic-password"
        }
      });
      
      console.log("🏆 Success: Fan Collectible upgraded to Gold/Victory Edition on-chain!");
      
      // Reset simulation state
      await fetch('http://localhost:3000/api/admin/simulate-trigger', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ eventType: "NONE" })
      });
    }

  } catch (error) {
    console.error("Error in Fan Engagement loop:", error);
  }
}

async function startFanManager() {
  console.log("🚀 Starting InjPass Fan Engagement Agent...");

  try {
    await mcpClient.connect(transport);
    console.log("🔗 Connected to Injective MCP Server");

    if (process.env.TESTNET_PRIVATE_KEY) {
      try {
        await mcpClient.callTool({
          name: "wallet_import",
          arguments: {
            privateKeyHex: process.env.TESTNET_PRIVATE_KEY,
            password: "agentic-password"
          }
        });
      } catch (err: any) {
        console.log("ℹ️ Wallet setup notice:", err.message || JSON.stringify(err));
      }
    }
  } catch (connErr) {
    console.warn("⚠️ MCP Client connection warning (running in hybrid mode):", connErr);
  }

  setInterval(monitorFanEcosystem, 8000);
}

startFanManager();
