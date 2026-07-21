import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { validateGateEntryOnChain } from './agent/validator.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock DB for active live match events
let liveMatchState = {
  eventId: "WC2026-FIN",
  minute: 72,
  score: "Argentina 2 - 1 France",
  recentEvent: "NONE" 
};

export interface x402ExpressOptions {
  amount?: number | string;
  receivingAddress?: string;
  network?: string;
}

// x402 middleware wrapper: Configures dynamic entry ticket paywall
export function x402Express(options: x402ExpressOptions = {}) {
  const receivingAddress = options.receivingAddress || process.env.WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";
  const network = (options.network || "eip155:84532") as "eip155:84532";

  const facilitatorClient = new HTTPFacilitatorClient({
    url: "https://x402.org/facilitator"
  });

  const resourceServer = new x402ResourceServer(facilitatorClient);
  resourceServer.register(network, new ExactEvmScheme());

  const routes = {
    "GET /api/ticket/secure-proof": {
      accepts: {
        scheme: "exact",
        price: "$0.01",
        network: network,
        payTo: receivingAddress,
        maxTimeoutSeconds: 60,
      },
      description: "Dynamic Secure Gate Entry Proof Token Generation",
    },
    "GET /api/ticket/generate-proof": {
      accepts: {
        scheme: "exact",
        price: "$0.01",
        network: network,
        payTo: receivingAddress,
        maxTimeoutSeconds: 60,
      },
      description: "Dynamic Secure Gate Entry Proof Token Generation",
    },
  };

  return paymentMiddleware(routes, resourceServer);
}

// x402 Middleware: Charging $0.01 USDC per dynamic gate-pass validation look up
const gatePaywall = x402Express({
  amount: "$0.01", 
  receivingAddress: process.env.WALLET_ADDRESS
});

/**
 * 1. x402 Gated Gate Pass Generation
 * Front-end requests this to refresh the turnstile QR code every 15 seconds
 */
app.get('/api/ticket/secure-proof', gatePaywall, (req: Request, res: Response) => {
  const { tokenId, ownerAddress, ticketId, userAddress } = req.query;

  const activeTokenId = tokenId || ticketId;
  const activeAddress = ownerAddress || userAddress;

  if (!activeTokenId || !activeAddress) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Generate an un-forgeable token containing an expiration window
  const timeWindow = Math.floor(Date.now() / 15000); // 15s rotating window
  const secret = process.env.JWT_SECRET || "inj-secret-key";
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${activeTokenId}-${activeAddress}-${timeWindow}`)
    .digest('hex');

  res.json({
    success: true,
    tokenId: activeTokenId,
    proofToken: hash,
    expiresIn: 15,
    matchContext: liveMatchState.score // Pass current live scores alongside proof metadata
  });
});

/**
 * Legacy/alias endpoint for ticket generate proof
 */
app.get('/api/ticket/generate-proof', gatePaywall, (req: Request, res: Response) => {
  const { ticketId, userAddress, tokenId, ownerAddress } = req.query;
  const activeTokenId = ticketId || tokenId;
  const activeAddress = userAddress || ownerAddress;

  const dynamicTimestamp = Math.floor(Date.now() / 15000);
  const secureGateToken = Buffer.from(`${activeTokenId}-${activeAddress}-${dynamicTimestamp}`).toString('base64');

  res.json({
    success: true,
    ticketId: activeTokenId,
    gateToken: secureGateToken,
    expiresInSeconds: 15
  });
});

/**
 * 2. Fan Engagement Endpoint
 * Autonomous agent polls this to look for triggers (e.g., goals scored)
 */
app.get('/api/events/live-feed', (req: Request, res: Response) => {
  res.json(liveMatchState);
});

// Admin endpoint to simulate match actions for your demo video / event panel
app.post('/api/admin/simulate-trigger', (req: Request, res: Response) => {
  const { eventType, recentEvent, score, minute, eventId } = req.body;
  if (eventType || recentEvent) liveMatchState.recentEvent = eventType || recentEvent;
  if (score) liveMatchState.score = score;
  if (minute !== undefined && !isNaN(Number(minute))) liveMatchState.minute = Number(minute);
  if (eventId) liveMatchState.eventId = eventId;
  
  res.json({
    success: true,
    message: `Simulated event: ${liveMatchState.recentEvent}`,
    state: liveMatchState
  });
});

/**
 * 3. Turnstile Gate Agent Validation Endpoint
 * Receives live scanned tokenId from turnstiles/frontend and executes contract.validateGateEntry(tokenId) on-chain
 */
app.post('/api/validator/scan', async (req: Request, res: Response) => {
  const { tokenId } = req.body;
  if (!tokenId) {
    return res.status(400).json({ error: "Missing scanned tokenId parameter" });
  }

  try {
    const result = await validateGateEntryOnChain(tokenId);
    return res.json(result);
  } catch (err: any) {
    console.error("❌ On-chain turnstile gate validation failed:", err.message || err);
    return res.status(500).json({
      error: "On-chain gate validation failed",
      details: err.message || String(err),
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 InjPass Ticketing Backend Operational on Port ${PORT}`));
