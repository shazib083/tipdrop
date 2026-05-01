// src/app/auth/register/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Zap, Mail, Eye, EyeOff, Loader2, AtSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration failed", description: data.error, variant: "destructive" });
        return;
      }
      // Auto-login
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      toast({ title: "Welcome to TipDrop! 🎉", variant: "success" });
      router.push("/dashboard");
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">TipDrop</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="font-display font-black text-5xl text-white leading-tight mb-4">
            Start<br />earning.
          </h2>
          <p className="text-white/70 text-lg">Set up your tip page in 2 minutes.</p>
          <div className="mt-8 space-y-3">
            {["✓  Free tip page at tipdrop.app/you", "✓  USDC via Circle SDK", "✓  Arc nanopayments enabled", "✓  QR code + shareable link"].map((f) => (
              <p key={f} className="text-white/80 text-sm">{f}</p>
            ))}
          </div>
        </div>
        <div className="relative text-white/50 text-sm">No credit card required</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">TipDrop</span>
          </div>

          <h1 className="font-display font-black text-3xl mb-2">Create account</h1>
          <p className="text-muted-foreground mb-8">
            Already have one?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

          <div className="mb-6">
            <WalletConnectButton className="w-full" label="Continue with Wallet" />
          </div>

          <div className="relative flex items-center mb-6">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 text-xs text-muted-foreground">or sign up with email</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="Satoshi" className="pl-10" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative mt-1.5">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="username" placeholder="satoshi" className="pl-10" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} required />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {form.username && (
              <p className="text-xs text-muted-foreground">
                Your tip page: <span className="text-primary font-mono">tipdrop.app/{form.username}</span>
              </p>
            )}

            <Button type="submit" className="w-full neon-glow" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create free account
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing up you agree to our{" "}
            <Link href="/terms" className="hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
