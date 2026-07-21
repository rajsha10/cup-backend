import { ethers } from "ethers";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config();

const INEVM_RPC_URL = process.env.INEVM_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || process.env.INJPASS_CONTRACT_ADDRESS || process.env.INJECTIVE_TESTNET_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY || process.env.PRIVATE_KEY;

const CONTRACT_ABI = [
  "function validateGateEntry(uint256 _tokenId) public",
  "function ticketRegistry(uint256) view returns (uint256 tokenId, address owner, string eventId, bool isValidated, bool teamWon, string baseUri)"
];

/**
 * Receives live scanned tokenId from frontend and executes contract.validateGateEntry(tokenId) on-chain
 */
export async function validateGateEntryOnChain(tokenId: string | number) {
  const numericTokenId = BigInt(tokenId || 1);
  console.log(`🎟️ Stadium Validator processing live scanned Token #${numericTokenId}...`);

  if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
    throw new Error("Missing CONTRACT_ADDRESS or TESTNET_PRIVATE_KEY in environment configuration.");
  }

  console.log(`🌐 Submitting contract.validateGateEntry(${numericTokenId}) on-chain to Injective EVM Testnet (${CONTRACT_ADDRESS})...`);
  const provider = new ethers.JsonRpcProvider(INEVM_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  const tx = await contract.validateGateEntry(numericTokenId);
  console.log(`⏳ On-chain Tx submitted! Hash: ${tx.hash}`);
  const blockExplorer = `https://testnet.blockscout.injective.network/tx/${tx.hash}`;
  console.log(`🔗 Explorer: ${blockExplorer}`);

  await tx.wait();
  console.log(`✅ Ticket #${numericTokenId} authenticated & validated on-chain via Injective EVM! Gate opened.`);

  return {
    success: true,
    tokenId: numericTokenId.toString(),
    txHash: tx.hash,
    blockExplorer,
  };
}

// Standalone Agent Listener (starts express server if run directly)
if (require.main === module) {
  const app = express();
  app.use(express.json());

  app.post(['/api/validator/scan', '/scan'], async (req: Request, res: Response) => {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ error: "Missing scanned tokenId parameter" });
    }

    try {
      const result = await validateGateEntryOnChain(tokenId);
      res.json(result);
    } catch (err: any) {
      console.error("❌ Gate validation on-chain error:", err.message || err);
      res.status(500).json({
        error: "On-chain gate validation failed",
        details: err.message || String(err),
      });
    }
  });

  const PORT = process.env.VALIDATOR_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🎟️ InjPass Stadium Gate Validator Agent running on Port ${PORT}`);
    console.log(`📡 Ready to receive live scanned token IDs from turnstiles.`);
  });
}
