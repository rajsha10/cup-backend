import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log("🔍 Testing Live On-Chain Connection to InjPassCollectible...");
  console.log(`🌐 RPC URL: ${process.env.INEVM_RPC_URL}`);
  console.log(`📍 Contract Address: ${process.env.CONTRACT_ADDRESS}`);
  console.log(`🔑 Wallet Address: ${process.env.WALLET_ADDRESS}`);

  const provider = new ethers.JsonRpcProvider(process.env.INEVM_RPC_URL);
  const wallet = new ethers.Wallet(process.env.TESTNET_PRIVATE_KEY, provider);

  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function admin() view returns (address)",
    "function nextTokenId() view returns (uint256)",
    "function ticketRegistry(uint256) view returns (string eventId, uint256 seatNumber, string baseUri, bool isValidated, bool teamWon)",
    "function purchaseTicket(string _eventId, uint256 _seatNumber, uint256 _price, string _initialUri) public"
  ];

  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

  const [name, symbol, admin, nextTokenId] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.admin(),
    contract.nextTokenId()
  ]);

  console.log("\n=======================================================");
  console.log("✅ LIVE ON-CHAIN CONTRACT VERIFIED!");
  console.log(`- Contract Name: ${name}`);
  console.log(`- Symbol: ${symbol}`);
  console.log(`- Admin Address: ${admin}`);
  console.log(`- Total Tickets Minted: ${nextTokenId.toString()}`);
  console.log("=======================================================\n");

  // Mint ticket #0 / #1 if zero tickets minted
  if (nextTokenId === 0n) {
    console.log("⚡ Minting initial test ticket #0 on-chain...");
    const tx = await contract.purchaseTicket("WC2026-FIN", 104, 0, "ipfs://initial-ticket-uri");
    console.log(`⏳ Tx Submitted! Hash: ${tx.hash}`);
    console.log(`🔗 Blockscout Explorer: https://testnet.blockscout.injective.network/tx/${tx.hash}`);
    await tx.wait();
    console.log("🎉 Initial Ticket #0 Minted Successfully on Injective EVM Testnet!");
  } else {
    const ticket0 = await contract.ticketRegistry(0);
    console.log(`🎫 Ticket #0 State: Seat #${ticket0.seatNumber}, Validated: ${ticket0.isValidated}, TeamWon: ${ticket0.teamWon}`);
  }
}

main().catch(console.error);
