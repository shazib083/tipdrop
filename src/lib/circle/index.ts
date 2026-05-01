// src/lib/circle/index.ts
// Circle SDK — USDC payment integration

import { v4 as uuidv4 } from "uuid";

const CIRCLE_API_BASE = "https://api-sandbox.circle.com/v1";

interface CirclePaymentRequest {
  amount: number;
  currency?: string;
  sourceWalletId: string;
  destinationWalletId: string;
  idempotencyKey?: string;
  description?: string;
}

interface CircleWalletCreateRequest {
  idempotencyKey?: string;
  entitySecretCiphertext?: string;
  walletSetId: string;
  count?: number;
  blockchains?: string[];
}

class CircleSDK {
  private apiKey: string;
  private walletSetId: string;

  constructor() {
    this.apiKey = process.env.CIRCLE_API_KEY || "";
    this.walletSetId = process.env.CIRCLE_WALLET_SET_ID || "";
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST" | "PUT" = "GET",
    body?: object
  ): Promise<T> {
    const res = await fetch(`${CIRCLE_API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(
        `Circle API error ${res.status}: ${JSON.stringify(error)}`
      );
    }

    return res.json();
  }

  /**
   * Create a managed wallet for a new user
   */
  async createWallet(userId: string): Promise<{ walletId: string; address: string }> {
    const idempotencyKey = uuidv4();

    const response = await this.request<{
      data: { wallets: Array<{ id: string; address: string }> };
    }>("/wallets", "POST", {
      idempotencyKey,
      entitySecretCiphertext: process.env.CIRCLE_ENTITY_SECRET,
      walletSetId: this.walletSetId,
      count: 1,
      blockchains: ["ARC-TESTNET"], // Arc testnet
      metadata: [{ name: `tipdrop-user-${userId}`, refId: userId }],
    });

    const wallet = response.data.wallets[0];
    return { walletId: wallet.id, address: wallet.address };
  }

  /**
   * Get wallet balance (USDC)
   */
  async getWalletBalance(walletId: string): Promise<number> {
    const response = await this.request<{
      data: {
        tokenBalances: Array<{ token: { symbol: string }; amount: string }>;
      };
    }>(`/wallets/${walletId}/balances`);

    const usdc = response.data.tokenBalances.find(
      (b) => b.token.symbol === "USDC"
    );
    return usdc ? parseFloat(usdc.amount) : 0;
  }

  /**
   * Transfer USDC between Circle wallets
   */
  async transfer(req: CirclePaymentRequest): Promise<{
    transferId: string;
    txHash: string | null;
    status: string;
  }> {
    const idempotencyKey = req.idempotencyKey || uuidv4();

    const response = await this.request<{
      data: { id: string; transactionHash: string | null; state: string };
    }>("/transfers", "POST", {
      idempotencyKey,
      source: { type: "wallet", id: req.sourceWalletId },
      destination: { type: "wallet", id: req.destinationWalletId },
      amount: {
        amount: req.amount.toFixed(2),
        currency: req.currency || "USD",
      },
    });

    return {
      transferId: response.data.id,
      txHash: response.data.transactionHash,
      status: response.data.state,
    };
  }

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: string): Promise<{
    status: string;
    txHash: string | null;
  }> {
    const response = await this.request<{
      data: { state: string; transactionHash: string | null };
    }>(`/transfers/${transferId}`);

    return {
      status: response.data.state,
      txHash: response.data.transactionHash,
    };
  }

  /**
   * Create payment intent for external wallet → Circle wallet
   */
  async createPaymentIntent(
    amount: number,
    destinationWalletAddress: string
  ): Promise<{ paymentIntentId: string; depositInstructions: object }> {
    const idempotencyKey = uuidv4();

    const response = await this.request<{
      data: { id: string; paymentMethods: object[] };
    }>("/paymentIntents", "POST", {
      idempotencyKey,
      amount: { amount: amount.toFixed(2), currency: "USD" },
      settlementCurrency: "USD",
      paymentMethods: [
        {
          type: "blockchain",
          chain: "ARC",
        },
      ],
    });

    return {
      paymentIntentId: response.data.id,
      depositInstructions: response.data.paymentMethods[0] || {},
    };
  }

  /**
   * Webhook verification
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // In production, verify HMAC signature from Circle
    // For now, basic check
    return typeof signature === "string" && signature.length > 0;
  }
}

export const circle = new CircleSDK();
export default circle;
