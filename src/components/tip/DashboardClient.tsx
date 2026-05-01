// src/components/tip/DashboardClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, TrendingUp, Users, Zap, DollarSign, ArrowUpRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRCodeModal } from "@/components/tip/QRCodeModal";
import { formatAmount, formatRelativeTime, getTipUrl } from "@/lib/utils";

interface DashboardData {
  user: any;
  stats: {
    totalReceived: number;
    totalTips: number;
    totalSent: number;
    tipsSent: number;
    weeklyReceived: number;
    weeklyTips: number;
    monthlyReceived: number;
    averageTip: number;
  };
  recentTips: any[];
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-500",
  PENDING: "bg-yellow-500/10 text-yellow-500",
  PROCESSING: "bg-blue-500/10 text-blue-500",
  FAILED: "bg-red-500/10 text-red-500",
};

export function DashboardClient({ data, userId }: { data: DashboardData; userId: string }) {
  const { user, stats, recentTips } = data;
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const tipUrl = getTipUrl(user?.username || userId);

  const copyLink = () => {
    navigator.clipboard.writeText(tipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const STAT_CARDS = [
    {
      label: "Total received",
      value: `$${formatAmount(stats.totalReceived)}`,
      sub: `${stats.totalTips} tips`,
      icon: DollarSign,
      color: "text-neon-green",
      bg: "bg-green-500/10",
    },
    {
      label: "This week",
      value: `$${formatAmount(stats.weeklyReceived)}`,
      sub: `${stats.weeklyTips} tips`,
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Average tip",
      value: `$${formatAmount(stats.averageTip)}`,
      sub: "per tip",
      icon: Zap,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Tips sent",
      value: `$${formatAmount(stats.totalSent)}`,
      sub: `${stats.tipsSent} sent`,
      icon: Users,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl">
            Hey, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's your tipping overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowQR(true)}>
            QR Code
          </Button>
          <Button size="sm" asChild className="neon-glow">
            <Link href={`/${user?.username}`} target="_blank">
              View tip page <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Tip link card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Your tip link</p>
          <p className="text-sm font-mono text-primary truncate">{tipUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${user?.username}`} target="_blank">
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="font-display font-black text-2xl mb-0.5">{value}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
                <div className="text-xs font-medium mt-1">{label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent tips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent tips</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/transactions" className="text-xs gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentTips.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No tips yet</p>
              <p className="text-sm text-muted-foreground">Share your tip link to start receiving tips!</p>
              <Button className="mt-4" size="sm" onClick={copyLink}>
                Copy tip link
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTips.map((tip, i) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={tip.isAnonymous ? "" : tip.sender?.image || ""} />
                    <AvatarFallback className="text-xs">
                      {tip.isAnonymous ? "?" : tip.sender?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {tip.isAnonymous ? "Anonymous" : tip.sender?.name || "Unknown"}
                    </p>
                    {tip.message && (
                      <p className="text-xs text-muted-foreground truncate">"{tip.message}"</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-sm text-neon-green">
                      +${formatAmount(tip.amount)} {tip.token}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[tip.status] || ""}`}>
                        {tip.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(tip.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile completion nudge */}
      {!user?.bio && (
        <Card className="border-dashed">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Complete your profile</p>
              <p className="text-sm text-muted-foreground">Add a bio and social links to get more tips.</p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/profile">Update →</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <QRCodeModal
        open={showQR}
        onClose={() => setShowQR(false)}
        url={tipUrl}
        username={user?.username}
      />
    </div>
  );
}
