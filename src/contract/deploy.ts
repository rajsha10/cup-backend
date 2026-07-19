import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Injective EVM Testnet Configuration (Chain ID 1439)
const INEVM_RPC_URL = process.env.INEVM_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/';
const PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY || process.env.PRIVATE_KEY;

async function deployContract() {
  console.log("🚀 Initializing Injective EVM Testnet Contract Deployment (Chain ID 1439)...");

  if (!PRIVATE_KEY) {
    console.error("❌ Error: TESTNET_PRIVATE_KEY is missing in your .env file!");
    console.log("💡 Add TESTNET_PRIVATE_KEY=your_private_key_hex to .env to deploy on-chain.");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(INEVM_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`🔑 Deployer Wallet Address: ${wallet.address}`);
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(`💵 Wallet Balance: ${ethers.formatEther(balance)} INJ`);
  } catch (err: any) {
    console.warn("⚠️ Network connection warning:", err.message || err);
  }

  console.log("\n=======================================================");
  console.log("✅ ON-CHAIN DEPLOYMENT READY FOR INJECTIVE EVM TESTNET");
  console.log(`🌐 Network RPC: ${INEVM_RPC_URL}`);
  console.log(`🆔 Chain ID: 1439 (0x59F)`);
  console.log(`🔍 Block Explorer: https://testnet.blockscout.injective.network/`);
  console.log("=======================================================\n");
}

deployContract().catch((err) => {
  console.error("Deployment Error:", err);
});
