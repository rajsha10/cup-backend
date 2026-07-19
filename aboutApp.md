# AgenticCup Platform Overview

AgenticCup is an autonomous, statistically-driven sports prediction and hedging platform built on the **Model Context Protocol (MCP)**, the **x402 Micropayment Protocol**, and the **Injective Protocol** decentralized derivatives exchange.

---

## 🏗️ Architectural Design & Core Components

1. **Paywalled Premium Data Oracle (`src/api/server.ts`)**:
   - Built on an Express framework and monetized via the **x402 Protocol** (`@x402/express`).
   - The `/api/live-stats` endpoint delivers real-time sports statistics, including expected goals (`xG`) and match duration elapsed.
   - It requires automated micro-transactions (priced at `$0.01 USDC` on Base Sepolia) per request, validating machine-to-machine (M2M) billing before returning data.

2. **Mathematical Estimation Engine (`src/agent/trader.ts`)**:
   - Leverages Poisson probability distribution functions (via the `jstat` package) to calculate a team's real-time likelihood of winning a match.
   - Translates raw live stats (expected goals `xG`) into dynamically updated statistical probabilities.

3. **Autonomous Execution Agent & MCP Bridge (`src/agent/trader.ts`)**:
   - Periodically fetches live match data from the oracle.
   - Compares the mathematically generated win probability with the implied market odds.
   - If an edge exists (a delta exceeding the predefined threshold), the agent interacts with the Injective MCP server using JSON-RPC tool calls (`trade_open`, `market_price`, etc.) to automatically open leveraged derivatives hedges on Injective testnet.

---

## 🎯 Primary Use Cases

* **Autonomous Machine-to-Machine (M2M) Commerce**:
  API providers can sell high-frequency, premium data feeds (financial feeds, weather telemetry, or sports statistics) directly to programmatic AI agents on a pay-per-request basis.
* **On-Chain Prediction & Arbitrage Trading**:
  Agents can continuously monitor live events and exploit price deviations between actual statistical probabilities and the implied probabilities on prediction platforms (e.g., Polymarket) or decentralized sports betting platforms.
* **Dynamic Hedging for Event Risk**:
  Institutions or retail operators who have exposure to specific real-world events can use statistical agents to dynamically hedge portfolio risk on decentralized derivatives exchanges in real time.

---

## 🌐 Real-World Value & Innovation

* **Standardizing Agent-Blockchain Integration (MCP)**:
  By translating blockchain actions into standard MCP tools, the codebase enables AI agents and LLMs to interact natively with Web3 infrastructure (signing transactions, trading derivatives, managing assets) using standardized interfaces.
* **The Agentic Web Economy (x402)**:
  Traditional SaaS licensing (fixed subscriptions) is poorly suited for autonomous agents that only require episodic or high-frequency data. x402 allows agents to pay tiny fractions of a cent per API call directly via stablecoins.
* **Ultra-Low Latency Statistical Trading**:
  By replacing manual trading processes with an automated mathematical loop, the platform captures statistical inefficiencies in live sports and event markets before they correct, removing human emotion and lag from the execution path.
