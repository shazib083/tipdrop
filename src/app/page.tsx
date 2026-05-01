// src/app/page.tsx
"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Zap, ArrowRight, Copy, Check, Github, Twitter,
  Send, Shield, Globe, ChevronDown, Star, TrendingUp,
  CreditCard, Users, Lock, Sparkles
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getTipUrl } from "@/lib/utils";

const TICKER_ITEMS = [
  "USDC", "Circle", "Arc Testnet", "Crypto Tips", "Nanopayments",
  "Web3", "Decentralised", "No Fees", "Instant", "USDC",
];

const STATS = [
  { label: "Tips sent", value: "$2.4M+", icon: TrendingUp },
  { label: "Creators paid", value: "12,000+", icon: Users },
  { label: "Avg tip time", value: "< 3s", icon: Zap },
  { label: "Uptime", value: "99.9%", icon: Shield },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect your wallet",
    desc: "Link MetaMask or any WalletConnect-compatible wallet. No signup needed to tip.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    step: "02",
    title: "Find anyone to tip",
    desc: "Search by username, paste a wallet address, or use their social handle. We resolve it.",
    color: "from-violet-500 to-purple-400",
  },
  {
    step: "03",
    title: "Send USDC instantly",
    desc: "Choose your amount, write a message, confirm. Tips land in seconds on Arc testnet.",
    color: "from-pink-500 to-rose-400",
  },
  {
    step: "04",
    title: "Track & withdraw",
    desc: "Dashboard shows all tips received. Withdraw to any address or keep building balance.",
    color: "from-amber-500 to-orange-400",
  },
];

const FEATURES = [
  { icon: Zap, title: "Nanopayments", desc: "Arc testnet enables micro-tips from $0.01 with near-zero gas fees.", color: "text-neon-yellow bg-yellow-500/10" },
  { icon: Shield, title: "Circle USDC", desc: "Stable, regulated USDC payments via Circle's trusted SDK.", color: "text-blue-400 bg-blue-500/10" },
  { icon: Globe, title: "Any platform", desc: "Share your tip link on X, GitHub, Telegram, Discord — anywhere.", color: "text-neon-green bg-green-500/10" },
  { icon: CreditCard, title: "No signup to tip", desc: "Tippers don't need an account. Just connect wallet and tip.", color: "text-violet-400 bg-violet-500/10" },
  { icon: Lock, title: "Non-custodial", desc: "Your keys, your crypto. We never hold your funds.", color: "text-pink-400 bg-pink-500/10" },
  { icon: Sparkles, title: "Beautiful profiles", desc: "Customisable tip pages that convert visitors to supporters.", color: "text-orange-400 bg-orange-500/10" },
];

const TESTIMONIALS = [
  { name: "vitalik.eth", handle: "@vitalik", text: "Finally a tipping platform that doesn't charge absurd fees. The Arc integration is 🔥", avatar: "V", color: "#627EEA" },
  { name: "punk6529", handle: "@punk6529", text: "Set up my tip page in 2 minutes. Got my first tip 10 minutes later. This is the future.", avatar: "P", color: "#FF0099" },
  { name: "stani.lens", handle: "@stani", text: "We integrated TipDrop into Lens profiles. The QR code feature alone is worth it.", avatar: "S", color: "#00FF94" },
];

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  return <span className="font-display font-black">{value}{suffix}</span>;
}

function TickerBar() {
  return (
    <div className="w-full overflow-hidden border-y border-border/50 py-3 bg-muted/30">
      <div className="flex animate-marquee whitespace-nowrap gap-12">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function TipDemoWidget() {
  const [handle, setHandle] = useState("vitalik");
  const [copied, setCopied] = useState(false);
  const tipUrl = `tipdrop.app/${handle || "username"}`;

  const copy = () => {
    navigator.clipboard.writeText(`https://${tipUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="relative mx-auto max-w-md"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-green-500/20 rounded-3xl blur-xl" />
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl">
        {/* Header dots */}
        <div className="flex items-center gap-1.5 mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">tipdrop.app</span>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Who do you want to tip?
        </p>

        {/* Platform tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { label: "GitHub", icon: Github },
            { label: "X", icon: Twitter },
            { label: "Wallet", icon: Zap },
            { label: "Email", icon: Send },
          ].map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                i === 1
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full pl-7 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="username"
          />
        </div>

        {/* Tip link */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 border border-border/50 rounded-xl">
          <span className="text-xs text-primary font-mono flex-1 truncate">{tipUrl}</span>
          <button
            onClick={copy}
            className="flex-shrink-0 p-1 hover:bg-muted rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 text-sm h-10" onClick={copy}>
            <Copy className="w-3.5 h-3.5 mr-2" />
            Copy Link
          </Button>
          <Button className="flex-1 text-sm h-10 neon-glow" asChild>
            <Link href={`/${handle}`}>
              Tip Now <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeading({ badge, title, subtitle, className }: {
  badge?: string; title: React.ReactNode; subtitle?: string; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={cn("text-center max-w-2xl mx-auto", className)}
    >
      {badge && (
        <Badge variant="outline" className="mb-4 text-xs font-mono uppercase tracking-wider">
          {badge}
        </Badge>
      )}
      <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground text-lg leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="outline" className="mb-6 text-xs font-mono gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  Powered by Arc + Circle · Live on Testnet
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6"
              >
                <span className="block">TIP.</span>
                <span className="block text-gradient">ANYONE.</span>
                <span className="block text-neon-green" style={{ WebkitTextStroke: "2px #00FF94", color: "transparent" }}>
                  INSTANTLY.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
              >
                Send crypto tips to anyone — by username, GitHub, X, or wallet address.
                No signup required. Powered by Circle USDC and Arc nanopayments.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button size="lg" className="neon-glow text-base font-semibold" asChild>
                  <Link href="/auth/register">
                    Create my tip page
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base" asChild>
                  <Link href="/alice">
                    See an example →
                  </Link>
                </Button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 mt-8"
              >
                <div className="flex -space-x-2">
                  {["#0066FF","#FF0099","#00FF94","#FFE500","#7C3AED"].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-background" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground">Loved by 12,000+ creators</p>
                </div>
              </motion.div>
            </div>

            {/* Right: demo widget */}
            <TipDemoWidget />
          </div>
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────── */}
      <TickerBar />

      {/* ── Stats ───────────────────────────────────────── */}
      <section className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ label, value, icon: Icon }, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <motion.div
                  key={label}
                  ref={ref}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl font-display font-black mb-1">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="How it works"
            title={<>Four steps to your<br /><span className="text-gradient">first tip</span></>}
            subtitle="From zero to receiving crypto tips in under 3 minutes."
          />

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, color }, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: "-50px" });
              return (
                <motion.div
                  key={step}
                  ref={ref}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15 }}
                  className="relative group"
                >
                  <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full">
                    <div className={cn("text-5xl font-display font-black bg-gradient-to-r bg-clip-text text-transparent mb-4", color)}>
                      {step}
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 text-muted-foreground">→</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Features"
            title={<>Everything you need<br />to <span className="text-gradient-pink">get tipped</span></>}
            subtitle="Built on the best Web3 infrastructure with a consumer-grade UX."
          />

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true, margin: "-50px" });
              return (
                <motion.div
                  key={title}
                  ref={ref}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-border bg-card card-hover"
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Testimonials"
            title={<>Loved by<br /><span className="text-gradient">crypto creators</span></>}
          />

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, handle, text, avatar, color }, i) => {
              const ref = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <motion.div
                  key={handle}
                  ref={ref}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15 }}
                  className="p-6 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-sm leading-relaxed mb-6 text-foreground/90">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white"
                      style={{ background: color }}
                    >
                      {avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-xs text-muted-foreground">{handle}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Pricing"
            title={<>Transparent,<br /><span className="text-gradient">creator-first</span> pricing</>}
            subtitle="Keep more of what you earn. No hidden fees."
          />

          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "/mo",
                desc: "For creators just getting started",
                features: ["Tip page + QR code", "USDC payments", "Basic analytics", "Social links (3)", "Email support"],
                cta: "Start free",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$9",
                period: "/mo",
                desc: "For serious creators",
                features: ["Everything in Free", "Custom tip link slug", "Advanced analytics", "Unlimited social links", "Priority support", "Nanopayment batching", "Webhook integrations"],
                cta: "Start Pro",
                highlighted: true,
                badge: "Most Popular",
              },
              {
                name: "Team",
                price: "$29",
                period: "/mo",
                desc: "For projects & communities",
                features: ["Everything in Pro", "5 team members", "Shared dashboard", "API access", "Custom branding", "SLA support", "Circle gateway direct"],
                cta: "Start Team",
                highlighted: false,
              },
            ].map(({ name, price, period, desc, features, cta, highlighted, badge }) => (
              <div
                key={name}
                className={cn(
                  "relative p-8 rounded-2xl border transition-all",
                  highlighted
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-105"
                    : "border-border bg-card"
                )}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="text-xs font-mono">{badge}</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display font-bold text-xl mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-4xl">{price}</span>
                    <span className="text-muted-foreground">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-neon-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("w-full", highlighted && "neon-glow")}
                  variant={highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth/register">{cta}</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Network fees only: 0.5% per tip on Pro · 0% on Team · 1% on Free
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-violet-700" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight"
          >
            Ready to start receiving tips?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 mb-10"
          >
            Join 12,000+ creators already earning on TipDrop.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="xl" variant="neon" asChild>
              <Link href="/auth/register">
                Create My Tip Page <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/auth/login">Sign up for more features →</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
