// src/components/tip/SettingsClient.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Wallet, Shield, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { formatAddress, SUPPORTED_TOKENS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  user: {
    id: string;
    email?: string | null;
    username?: string | null;
    walletAddress?: string | null;
    isPublic: boolean;
    acceptingTips: boolean;
    defaultToken: string;
    minTipAmount: number;
    circleWalletId?: string | null;
  };
}

export function SettingsClient({ user }: Props) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    isPublic: user.isPublic,
    acceptingTips: user.acceptingTips,
    defaultToken: user.defaultToken,
    minTipAmount: user.minTipAmount.toString(),
  });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic: settings.isPublic,
          acceptingTips: settings.acceptingTips,
          defaultToken: settings.defaultToken,
          minTipAmount: parseFloat(settings.minTipAmount) || 0.1,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Settings saved! ✓", variant: "success" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors focus:outline-none",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <div className={cn(
        "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
        checked && "translate-x-5"
      )} />
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {/* Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet & Payments
          </CardTitle>
          <CardDescription>Your connected wallets and payment settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Connected wallet</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {user.walletAddress ? formatAddress(user.walletAddress, 6) : "No wallet connected"}
                </p>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                user.walletAddress ? "bg-neon-green" : "bg-muted-foreground"
              )} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Circle wallet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.circleWalletId ? "Provisioned ✓" : "Not provisioned"}
                </p>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                user.circleWalletId ? "bg-neon-green" : "bg-yellow-400"
              )} />
            </div>
          </div>

          <div>
            <Label>Default token</Label>
            <div className="flex gap-2 mt-1.5">
              {SUPPORTED_TOKENS.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => setSettings({ ...settings, defaultToken: t.symbol })}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                    settings.defaultToken === t.symbol
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {t.icon} {t.symbol}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Minimum tip amount (USD)</Label>
            <div className="relative mt-1.5 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                className="pl-7"
                value={settings.minTipAmount}
                onChange={(e) => setSettings({ ...settings, minTipAmount: e.target.value })}
                min="0.01"
                step="0.01"
                max="100"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tips below this amount will be rejected</p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Public profile</p>
              <p className="text-xs text-muted-foreground">Allow anyone to find and view your tip page</p>
            </div>
            <Toggle checked={settings.isPublic} onChange={(v) => setSettings({ ...settings, isPublic: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Accepting tips</p>
              <p className="text-xs text-muted-foreground">Toggle to pause receiving tips temporarily</p>
            </div>
            <Toggle checked={settings.acceptingTips} onChange={(v) => setSettings({ ...settings, acceptingTips: v })} />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => alert("Please contact support to delete your account.")}>
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2 neon-glow">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
