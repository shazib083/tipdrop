// src/components/tip/TipPageClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Twitter, Github, Send, Globe, Share2, QrCode, ExternalLink, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TipForm } from "@/components/tip/TipForm";
import { QRCodeModal } from "@/components/tip/QRCodeModal";
import { getTipUrl, formatAmount, formatRelativeTime, PLATFORMS } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface Props {
  user: UserProfile & {
    tipsReceived: Array<{
      id: string;
      amount: number;
      token: string;
      message?: string | null;
      createdAt: Date;
      sender?: { name?: string | null; username?: string | null; image?: string | null } | null;
    }>;
  };
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  TWITTER: <Twitter className="w-4 h-4" />,
  GITHUB: <Github className="w-4 h-4" />,
  TELEGRAM: <Send className="w-4 h-4" />,
  WEBSITE: <Globe className="w-4 h-4" />,
};

export function TipPageClient({ user }: Props) {
  const [showQR, setShowQR] = useState(false);
  const tipUrl = getTipUrl(user.username || user.id);
  const displayName = user.profile?.displayName || user.name || user.username || "Anonymous";
  const coverColor = user.profile?.coverColor || "#0066FF";

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Tip ${displayName}`, url: tipUrl });
    } else {
      navigator.clipboard.writeText(tipUrl);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-14 px-4 sm:px-6 bg-background/80 backdrop-blur-xl border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-display font-bold text-sm">TipDrop</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowQR(true)} className="gap-1.5">
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={share} className="gap-1.5">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Get your page →</Link>
          </Button>
        </div>
      </nav>

      <main className="pt-14">
        {/* Cover */}
        <div
          className="h-40 sm:h-52 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${coverColor}dd, ${coverColor}66)`,
          }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>

        {/* Profile section */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-16 mb-6 flex items-end justify-between">
            <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback
                className="text-3xl font-display font-bold"
                style={{ background: coverColor, color: "white" }}
              >
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs font-mono gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                Accepting tips
              </Badge>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display font-black text-2xl sm:text-3xl">{displayName}</h1>
            {user.username && (
              <p className="text-muted-foreground text-sm font-mono">@{user.username}</p>
            )}
            {user.bio && (
              <p className="mt-3 text-foreground/80 leading-relaxed">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div>
                <span className="font-display font-bold text-foreground">${formatAmount(user.totalReceived)}</span>
                {" "}received
              </div>
              <div>
                <span className="font-display font-bold text-foreground">{user.totalTips}</span>
                {" "}tips
              </div>
            </div>

            {/* Social links */}
            {user.socialLinks.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {user.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-muted transition-all"
                  >
                    {PLATFORM_ICONS[link.platform] || <Globe className="w-3.5 h-3.5" />}
                    {link.handle}
                    <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Tip form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <TipForm receiverId={user.id} receiverName={displayName} />
          </motion.div>

          {/* Recent tips */}
          {user.tipsReceived.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 mb-12"
            >
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Recent supporters
              </h2>
              <div className="space-y-3">
                {user.tipsReceived.map((tip, i) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={tip.sender?.image || ""} />
                      <AvatarFallback className="text-xs">
                        {tip.sender?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tip.sender?.name || "Supporter"}</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(tip.createdAt)}</span>
                      </div>
                      {tip.message && (
                        <p className="text-sm text-muted-foreground mt-1">"{tip.message}"</p>
                      )}
                    </div>
                    <div className="font-display font-bold text-sm text-neon-green flex-shrink-0">
                      ${formatAmount(tip.amount)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer brand */}
      <div className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="text-primary hover:underline font-medium">TipDrop</Link>
          {" "}·{" "}Arc + Circle
        </p>
      </div>

      <QRCodeModal open={showQR} onClose={() => setShowQR(false)} url={tipUrl} username={user.username} />
    </div>
  );
}
