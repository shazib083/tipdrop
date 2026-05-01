// src/components/tip/TransactionsClient.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmount, formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Tip } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "success",
  PENDING: "warning",
  PROCESSING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
};

interface Props {
  received: (Tip & { sender?: any })[];
  sent: (Tip & { receiver?: any })[];
}

export function TransactionsClient({ received, sent }: Props) {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [query, setQuery] = useState("");

  const tips = tab === "received" ? received : sent;
  const filtered = tips.filter((t) => {
    const peer = tab === "received" ? t.sender : (t as any).receiver;
    const name = peer?.name || "";
    const msg = t.message || "";
    return (
      name.toLowerCase().includes(query.toLowerCase()) ||
      msg.toLowerCase().includes(query.toLowerCase()) ||
      (t.txHash || "").toLowerCase().includes(query.toLowerCase())
    );
  });

  const totalReceived = received
    .filter((t) => t.status === "CONFIRMED")
    .reduce((s, t) => s + t.amount, 0);

  const totalSent = sent
    .filter((t) => t.status === "CONFIRMED")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl">Transactions</h1>
        <p className="text-muted-foreground mt-1">Your complete tip history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5 text-neon-green" />
              </div>
              <span className="text-sm text-muted-foreground">Total received</span>
            </div>
            <div className="font-display font-black text-2xl">${formatAmount(totalReceived)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{received.filter(t => t.status === "CONFIRMED").length} confirmed tips</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Total sent</span>
            </div>
            <div className="font-display font-black text-2xl">${formatAmount(totalSent)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sent.filter(t => t.status === "CONFIRMED").length} confirmed tips</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          {/* Tabs */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {(["received", "sent"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                    tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t} ({(t === "received" ? received : sent).length})
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8 text-sm w-40 sm:w-56"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tip, i) => {
                const peer = tab === "received" ? tip.sender : (tip as any).receiver;
                const isIncoming = tab === "received";
                return (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isIncoming ? "bg-green-500/10" : "bg-blue-500/10"
                    )}>
                      {isIncoming
                        ? <ArrowDownLeft className="w-4 h-4 text-neon-green" />
                        : <ArrowUpRight className="w-4 h-4 text-blue-400" />
                      }
                    </div>
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarImage src={tip.isAnonymous ? "" : peer?.image || ""} />
                      <AvatarFallback className="text-xs">
                        {tip.isAnonymous ? "?" : peer?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {tip.isAnonymous ? "Anonymous" : peer?.name || "Unknown"}
                        {peer?.username && (
                          <span className="text-muted-foreground font-normal ml-1">@{peer.username}</span>
                        )}
                      </p>
                      {tip.message && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">"{tip.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(tip.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className={cn(
                        "font-display font-bold text-sm",
                        isIncoming ? "text-neon-green" : "text-foreground"
                      )}>
                        {isIncoming ? "+" : "-"}${formatAmount(tip.amount)} {tip.token}
                      </p>
                      <Badge variant={STATUS_STYLES[tip.status] as any} className="text-xs">
                        {tip.status.toLowerCase()}
                      </Badge>
                      {tip.txHash && (
                        <a
                          href={`https://explorer.testnet.arc.fun/tx/${tip.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary justify-end"
                        >
                          {tip.txHash.slice(0, 8)}...
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
