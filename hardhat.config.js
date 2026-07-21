import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const rawPrivateKey = process.env.TESTNET_PRIVATE_KEY || process.env.PRIVATE_KEY || "";
const formattedPrivateKey = rawPrivateKey
  ? rawPrivateKey.startsWith("0x")
    ? rawPrivateKey
    : `0x${rawPrivateKey}`
  : "";

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src/contract",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    injectiveTestnet: {
      url: process.env.INEVM_RPC_URL || "https://k8s.testnet.json-rpc.injective.network/",
      chainId: 1439,
      accounts: formattedPrivateKey ? [formattedPrivateKey] : [],
    },
  },
};
