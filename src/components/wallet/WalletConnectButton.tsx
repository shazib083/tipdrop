// src/components/wallet/WalletConnectButton.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

interface Props {
  className?: string;
  label?: string;
  onSuccess?: (address: string) => void;
}

export function WalletConnectButton({ className, label = "Continue with Wallet", onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    if (!window.ethereum) {
      toast({
        title: "No wallet found",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Request accounts
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const address = accounts[0];
      if (!address) throw new Error("No account selected");

      // Create sign message
      const message = `Sign in to TipDrop\n\nAddress: ${address}\nTimestamp: ${Date.now()}`;

      // Request signature
      const signature = (await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;

      // Sign in via NextAuth wallet provider
      const res = await signIn("wallet", {
        address,
        signature,
        message,
        redirect: false,
      });

      if (res?.error) {
        toast({ title: "Wallet sign in failed", description: res.error, variant: "destructive" });
      } else {
        toast({ title: "Wallet connected! 🔗", variant: "success" });
        onSuccess?.(address);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (!msg.includes("rejected")) {
        toast({ title: "Connection failed", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("gap-2 font-semibold border-2 hover:border-primary/50", className)}
      onClick={connect}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {loading ? "Connecting..." : label}
    </Button>
  );
}
