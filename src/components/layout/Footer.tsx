// src/components/layout/Footer.tsx
import Link from "next/link";
import { Zap } from "lucide-react";

const links = {
  Product: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Explore creators", href: "/explore" },
    { label: "Changelog", href: "/changelog" },
  ],
  Developers: [
    { label: "API docs", href: "/docs/api" },
    { label: "Arc integration", href: "/docs/arc" },
    { label: "Circle SDK", href: "/docs/circle" },
    { label: "Webhooks", href: "/docs/webhooks" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Brand", href: "/brand" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                Tip<span className="text-primary">Drop</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Crypto tips for anyone, anywhere. 60+ currencies supported.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
                Arc Testnet
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                Circle SDK
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-display font-semibold text-sm mb-4 uppercase tracking-wider text-foreground">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TipDrop. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">
              Powered by{" "}
              <span className="text-foreground font-medium">Arc</span> &{" "}
              <span className="text-foreground font-medium">Circle</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
