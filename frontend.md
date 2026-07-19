# 🌐 AgenticCup Frontend Specification (Vite + React + TypeScript)

This document outlines the frontend implementation plan using Vite, React, TypeScript, and the defined design system.

---

## 🎨 Theme & Visual Principles (Matching the Reference Design)

1. **Aesthetic Style**: High-impact modern athletics (light mode with a clean off-white background `#F4F4F6`, pure white glassmorphic panels, and vibrant electric blue `#1868FF` accenting).
2. **Typography**:
   - Headers: Condensed uppercase display font (Google Font `Antonio` or `Oswald`).
   - Body: Clean geometric sans-serif (Google Font `Outfit` or `Inter`).
3. **Core Elements**: Pill-shaped navigation bars, cards with metrics divided by thin vertical rules, and diagonal athletic accent stripes.

---

## 📂 Pages & Features

### 1. Landing Page (Home)
* **Hero Section**: Large, tall display title "PLAY WITH PASSION & STATS" (similar style to reference layout).
* **Live Features Showcase**: Visual cards illustrating how live match streaming connects to the mathematical Poisson engine and Injective smart contracts.
* **Key Stats Banner**: Displays global platform stats (e.g., "Active Agents", "Trades Settled", "Supported Leagues").

### 2. Dashboard
* **Match Oracle Widget**: Displays the live stats retrieved from the backend `GET /api/live-stats` (teams, actual score, match minute, and expected goals `xG`).
* **Win Probability Calculator Chart**: Real-time visualization of the Poisson distribution model's win probability output versus the implied market odds.
* **Smart Contract Logs**: Lists historical transactions/state updates retrieved from the `AgenticCupOracleRegistry.sol` smart contract (listening to the `OracleUpdate` event or reading the `oracleHistory` array).
* **Control Center**: Panel displaying the current Injective wallet balance, subaccount balance, and trade execution status.

### 3. About Page
* Explains the mechanics of the platform:
  * **Poisson Distribution**: How expected goals (`xG`) are converted to mathematical odds.
  * **x402 Micropayments**: How data feeds are monetized dynamically using stablecoins on Base Sepolia.
  * **Injective & MCP**: How autonomous AI agents actuate derivative orders without manual clicking.

### 4. Contact Page
* High-impact feedback form styled with glassmorphic input fields.
* Social/Github links matching the modern black-and-blue badge theme.

---

## 📁 Recommended Directory Structure

The project should follow a standard modular React + TypeScript setup:

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/             # Images, diagonal stripe SVGs, icons
│   ├── components/         # Reusable UI elements
│   │   ├── Button.tsx      # Pill button matching the theme
│   │   ├── Card.tsx        # Glassmorphic card container
│   │   └── Navbar.tsx      # Floating pill navbar
│   ├── context/            # Global state (e.g., Wallet / Web3 connection)
│   │   └── Web3Context.tsx
│   ├── hooks/              # Custom hooks for API / Contract fetching
│   │   ├── useLiveStats.ts # Fetches stats from Express backend
│   │   └── useOracleLogs.ts# Fetches logs from Ethereum/Injective EVM
│   ├── pages/              # Page views
│   │   ├── Home.tsx        # Landing Page
│   │   ├── Dashboard.tsx   # Trading & Oracle Dashboard
│   │   ├── About.tsx       # Informational page
│   │   └── Contact.tsx     # Developer/support form
│   ├── styles/
│   │   └── index.css       # Core theme styling (custom CSS properties)
│   ├── App.tsx             # Root router and app layout
│   └── main.tsx            # Vite entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔌 Backend & Blockchain Integration Blueprint

To drive the Dashboard, the frontend needs to interface with two external data feeds:

```mermaid
graph TD
    Frontend[React Frontend] -->|HTTP GET /api/live-stats + Auth / x402 Token| Express[Express Backend Oracle]
    Frontend -->|Ethers.js / Viem Read Contract| RegistryContract[AgenticCupOracleRegistry.sol]
    Express -->|x402 paywall checks| Facilitator[x402 Facilitator]
```

### 1. Connecting to the Express Data Server (`http://localhost:3000`)
The dashboard must request the live statistics. If interacting with the live paywall, the frontend will use the `@x402/core` client library to handle EVM micropayment handshakes, or provide the `MOCK_x402_PAYMENT_TOKEN` during development/testing.

**Example Fetch Utility (`useLiveStats.ts`)**:
```typescript
import { useState, useEffect } from 'react';

export function useLiveStats() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/live-stats", {
          headers: { "Authorization": "Bearer MOCK_x402_PAYMENT_TOKEN" }
        });
        const json = await response.json();
        if (json.status === "success") {
          setData(json.data);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Sync every 10s
    return () => clearInterval(interval);
  }, []);

  return { data, error };
}
```

### 2. Reading Smart Contract Logs (Ethereum / Base / Injective EVM)
The dashboard needs to show historical oracle data registered on-chain.
* **Provider**: Connects to the network (e.g., Base Sepolia or Injective's EVM layer) using Ethers.js or Viem.
* **Call**: Reads `getUpdateCount()` and loops through `oracleHistory(index)` or listens directly to the `OracleUpdate` event:
  ```typescript
  // Listening to real-time oracle writes
  contract.on("OracleUpdate", (matchId, elapsedTime, winProbability, agent) => {
    // Append to live logs list in Dashboard state
  });
  ```
