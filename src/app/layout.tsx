// src/app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { SessionProvider } from "@/components/layout/SessionProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "TipDrop — Tip Anyone, Anywhere", template: "%s | TipDrop" },
  description: "Send crypto tips to anyone — by username, email, GitHub, X, or wallet address. Powered by Circle & Arc.",
  keywords: ["crypto tips", "USDC", "web3 tipping", "Arc", "Circle"],
  authors: [{ name: "TipDrop" }],
  creator: "TipDrop",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "TipDrop",
    title: "TipDrop — Tip Anyone, Anywhere",
    description: "Send crypto tips to anyone in seconds. No signup required.",
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: "TipDrop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TipDrop — Tip Anyone, Anywhere",
    description: "Send crypto tips to anyone in seconds.",
    images: ["/og/default.png"],
  },
  icons: { icon: "/icons/favicon.ico", apple: "/icons/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
