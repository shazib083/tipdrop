// src/components/tip/TipForm.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wallet, CheckCircle2, XCircle, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { formatAmount, PRESET_AMOUNTS, SUPPORTED_TOKENS } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Step = "form" | "connecting" | "confirming" | "success" | "error";

interface Props {
  receiverId: string;
  receiverName: string;
  presetAmount?: number;
}

export function TipForm({ receiverId, receiverName, presetAmount }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState(presetAmount?.toString() || "");
  const [token, setToken] = useState("USDC");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.01; // 1% platform fee
  const total = numAmount + fee;

  const connectAndTip = async () => {
    if (!amount || numAmount <= 0) {
      toast({ title: "Enter an amount", variant: "destructive" });
      return;
    }
    if (numAmount < 0.01) {
      toast({ title: "Minimum tip is $0.01", variant: "destructive" });
      return;
    }

    setStep("connecting");

    try {
      // Check for MetaMask
      if (!window.ethereum) {
        throw new Error("No wallet detected. Please install MetaMask.");
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const fromAddress = accounts[0];
      if (!fromAddress) throw new Error("No account selected");

      // Switch to Arc Testnet if needed
      const chainId = parseInt(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || "1116");
      const chainHex = `0x${chainId.toString(16)}`;
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainHex }],
        });
      } catch (switchErr: unknown) {
        // Chain not added — add it
        if ((switchErr as { code?: number }).code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainHex,
                chainName: "Arc Testnet",
                nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
                rpcUrls: [process.env.NEXT_PUBLIC_ARC_TESTNET_RPC || "https://rpc.testnet.arc.fun"],
                blockExplorerUrls: ["https://explorer.testnet.arc.fun"],
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }

      setStep("confirming");

      // Initiate payment via API (Circle + Arc)
      const res = await fetch("/api/tips/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          amount: numAmount,
          token,
          message: message.trim() || undefined,
          isAnonymous,
          fromAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // If we have a contract address to call (USDC transfer on Arc)
      if (data.data?.toAddress && data.data?.usdcContract) {
        const { ethers } = await import("ethers");
        const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
        const signer = await provider.getSigner();

        const ERC20_ABI = [
          "function transfer(address to, uint256 amount) returns (bool)",
          "function decimals() view returns (uint8)",
        ];
        const usdc = new ethers.Contract(data.data.usdcContract, ERC20_ABI, signer);
        const decimals = await usdc.decimals();
        const amountWei = ethers.parseUnits(numAmount.toFixed(6), decimals);

        const tx = await usdc.transfer(data.data.toAddress, amountWei);
        const receipt = await tx.wait();

        // Confirm transaction with backend
        await fetch(`/api/tips/${data.data.tipId}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: receipt.hash, blockNumber: Number(receipt.blockNumber) }),
        });

        setTxHash(receipt.hash);
      } else {
        // Circle-managed wallet flow (server-side transfer)
        setTxHash(data.data?.txHash || null);
      }

      setStep("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("denied")) {
        setStep("form");
        toast({ title: "Transaction cancelled" });
      } else {
        setErrorMsg(msg);
        setStep("error");
      }
    }
  };

  const reset = () => {
    setStep("form");
    setAmount(presetAmount?.toString() || "");
    setMessage("");
    setTxHash(null);
    setErrorMsg("");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">
          Send {receiverName} a tip ⚡
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* ── Form ── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Token selector */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Token</Label>
                <div className="flex gap-2">
                  {SUPPORTED_TOKENS.map((t) => (
                    <button
                      key={t.symbol}
                      onClick={() => setToken(t.symbol)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                        token === t.symbol
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      <span>{t.icon}</span>
                      {t.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount presets */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Amount (USD)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAmount(p.toString())}
                      className={cn(
                        "py-2 rounded-xl border text-sm font-medium transition-all",
                        amount === p.toString()
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    className="pl-7 font-mono text-lg h-12"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Message <span className="text-muted-foreground/50">(optional)</span>
                </Label>
                <Textarea
                  placeholder={`Say something nice to ${receiverName}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={280}
                  className="resize-none h-20"
                />
                <div className="text-right text-xs text-muted-foreground mt-1">{message.length}/280</div>
              </div>

              {/* Anonymous toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    "relative w-10 h-6 rounded-full transition-colors",
                    isAnonymous ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    isAnonymous && "translate-x-4"
                  )} />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {isAnonymous ? <EyeOff className="w-3.5 h-3.5 inline mr-1" /> : <Eye className="w-3.5 h-3.5 inline mr-1" />}
                  Tip anonymously
                </span>
              </label>

              {/* Summary */}
              {numAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl bg-muted/50 border border-border p-4 space-y-2 text-sm"
                >
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tip amount</span>
                    <span className="font-mono">${formatAmount(numAmount)} {token}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform fee (1%)</span>
                    <span className="font-mono">${formatAmount(fee)} {token}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-2">
                    <span>Total</span>
                    <span className="font-mono">${formatAmount(total)} {token}</span>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={connectAndTip}
                className="w-full h-12 text-base font-semibold neon-glow gap-2"
                disabled={!numAmount || numAmount <= 0}
              >
                <Wallet className="w-4 h-4" />
                Connect wallet & tip ${formatAmount(numAmount || 0)}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Powered by Circle USDC + Arc Testnet · Non-custodial
              </p>
            </motion.div>
          )}

          {/* ── Connecting ── */}
          {step === "connecting" && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-display font-semibold text-lg">Connecting wallet...</p>
                <p className="text-sm text-muted-foreground mt-1">Please approve in your wallet</p>
              </div>
            </motion.div>
          )}

          {/* ── Confirming ── */}
          {step === "confirming" && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent flex items-center justify-center mx-auto animate-spin" />
              <div>
                <p className="font-display font-semibold text-lg">Processing tip...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sending ${formatAmount(numAmount)} {token} via Arc + Circle
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center space-y-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-neon-green" />
              </motion.div>
              <div>
                <p className="font-display font-black text-2xl">Tip sent! 🎉</p>
                <p className="text-muted-foreground mt-2">
                  ${formatAmount(numAmount)} {token} → {receiverName}
                </p>
              </div>
              {txHash && (
                <a
                  href={`https://explorer.testnet.arc.fun/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                >
                  {txHash.slice(0, 16)}...{txHash.slice(-8)}
                  <span className="text-muted-foreground">↗</span>
                </a>
              )}
              <Button onClick={reset} variant="outline" className="mt-2">
                Send another tip
              </Button>
            </motion.div>
          )}

          {/* ── Error ── */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center space-y-5"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <div>
                <p className="font-display font-bold text-xl">Transaction failed</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{errorMsg}</p>
              </div>
              <Button onClick={reset} variant="outline">Try again</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
