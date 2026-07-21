import hre from "hardhat";

async function main() {
  console.log("🚀 Starting InjPassCollectible deployment to Injective EVM Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer found. Please check TESTNET_PRIVATE_KEY in .env");
  }

  console.log(`🔑 Deploying with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💵 Account balance: ${hre.ethers.formatEther(balance)} INJ`);

  const InjPassCollectible = await hre.ethers.getContractFactory("InjPassCollectible");
  console.log("📦 Deploying InjPassCollectible contract...");
  const contract = await InjPassCollectible.deploy();

  const tx = contract.deploymentTransaction();
  if (tx) {
    console.log(`⏳ Transaction Submitted! Hash: ${tx.hash}`);
  }

  console.log("⏳ Waiting for transaction receipt...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("\n=======================================================");
  console.log("🎉 CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log(`📄 Contract Name: InjPassCollectible`);
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`👤 Admin Address: ${deployer.address}`);
  console.log(`🌐 Network: Injective EVM Testnet (Chain ID 1439)`);
  console.log(`🔍 Blockscout: https://testnet.blockscout.injective.network/address/${contractAddress}`);
  console.log("=======================================================\n");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
