// src/lib/arc/index.ts
// Arc Testnet — nanopayment integration via ethers.js

import { ethers } from "ethers";

// Arc Testnet config
export const ARC_TESTNET = {
  chainId: parseInt(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || "1116"),
  name: "Arc Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_ARC_TESTNET_RPC || "https://rpc.testnet.arc.fun",
  explorerUrl: "https://explorer.testnet.arc.fun",
  nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
};

// Minimal ERC-20 ABI for USDC transfers
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export class ArcClient {
  private provider: ethers.JsonRpcProvider;
  private usdcAddress: string;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrl);
    this.usdcAddress =
      process.env.NEXT_PUBLIC_USDC_CONTRACT ||
      "0x0000000000000000000000000000000000000000";
  }

  getProvider() {
    return this.provider;
  }

  getUSDCContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(
      this.usdcAddress,
      ERC20_ABI,
      signerOrProvider || this.provider
    );
  }

  /**
   * Get USDC balance for an address (server-side)
   */
  async getUSDCBalance(address: string): Promise<number> {
    try {
      const usdc = this.getUSDCContract();
      const [balance, decimals] = await Promise.all([
        usdc.balanceOf(address),
        usdc.decimals(),
      ]);
      return parseFloat(ethers.formatUnits(balance, decimals));
    } catch {
      return 0;
    }
  }

  /**
   * Server-side: send USDC using relayer private key
   */
  async sendUSDC(
    toAddress: string,
    amount: number
  ): Promise<{ txHash: string; blockNumber: number }> {
    const privateKey = process.env.ARC_PRIVATE_KEY;
    if (!privateKey) throw new Error("ARC_PRIVATE_KEY not configured");

    const signer = new ethers.Wallet(privateKey, this.provider);
    const usdc = this.getUSDCContract(signer);
    const decimals = await usdc.decimals();
    const amountWei = ethers.parseUnits(amount.toFixed(6), decimals);

    const tx = await usdc.transfer(toAddress, amountWei);
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      blockNumber: Number(receipt.blockNumber),
    };
  }

  /**
   * Verify a transaction on Arc testnet
   */
  async verifyTransaction(txHash: string): Promise<{
    confirmed: boolean;
    amount?: number;
    from?: string;
    to?: string;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return { confirmed: false };

      const tx = await this.provider.getTransaction(txHash);
      if (!tx) return { confirmed: false };

      // Parse ERC-20 Transfer event
      const usdc = this.getUSDCContract();
      const transferEvent = usdc.interface.getEvent("Transfer");
      if (!transferEvent) return { confirmed: receipt.status === 1 };

      for (const log of receipt.logs) {
        try {
          const parsed = usdc.interface.parseLog(log);
          if (parsed?.name === "Transfer") {
            const decimals = await usdc.decimals();
            return {
              confirmed: receipt.status === 1,
              amount: parseFloat(ethers.formatUnits(parsed.args[2], decimals)),
              from: parsed.args[0],
              to: parsed.args[1],
            };
          }
        } catch {
          // Not a USDC transfer log, skip
        }
      }

      return { confirmed: receipt.status === 1 };
    } catch {
      return { confirmed: false };
    }
  }

  /**
   * Nanopayment: batch accumulate micro-tips and settle periodically
   * This is the core Arc "nanopayment" pattern — aggregate small amounts
   * off-chain and settle on-chain in batches to save gas.
   */
  async submitNanopaymentBatch(
    payments: Array<{ address: string; amount: number }>
  ): Promise<{ txHash: string; batchTotal: number }> {
    const privateKey = process.env.ARC_PRIVATE_KEY;
    if (!privateKey) throw new Error("ARC_PRIVATE_KEY not configured");

    const signer = new ethers.Wallet(privateKey, this.provider);
    const usdc = this.getUSDCContract(signer);
    const decimals = await usdc.decimals();

    // For each payment in the batch, send USDC
    // In production you'd use a MultiSend contract to do this atomically
    const txHashes: string[] = [];
    let batchTotal = 0;

    for (const payment of payments) {
      const amountWei = ethers.parseUnits(payment.amount.toFixed(6), decimals);
      const tx = await usdc.transfer(payment.address, amountWei);
      const receipt = await tx.wait();
      txHashes.push(receipt.hash);
      batchTotal += payment.amount;
    }

    // Return the last tx hash as batch representative
    return {
      txHash: txHashes[txHashes.length - 1] || "",
      batchTotal,
    };
  }

  /**
   * Get the Arc testnet explorer URL for a tx
   */
  getTxExplorerUrl(txHash: string): string {
    return `${ARC_TESTNET.explorerUrl}/tx/${txHash}`;
  }

  /**
   * Get the Arc testnet explorer URL for an address
   */
  getAddressExplorerUrl(address: string): string {
    return `${ARC_TESTNET.explorerUrl}/address/${address}`;
  }
}

export const arcClient = new ArcClient();
export default arcClient;
