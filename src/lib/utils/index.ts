// src/lib/utils/index.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function generateUsername(base: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean.slice(0, 12)}${suffix}`;
}

export function getTipUrl(username: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/${username}`;
}

export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export const PRESET_AMOUNTS = [1, 5, 10, 25, 50, 100];

export const SUPPORTED_TOKENS = [
  { symbol: "USDC", name: "USD Coin", decimals: 6, icon: "💵" },
  { symbol: "ARC", name: "Arc Token", decimals: 18, icon: "⚡" },
];

export const PLATFORMS = {
  TWITTER: { label: "X (Twitter)", icon: "𝕏", color: "#000000", placeholder: "username" },
  GITHUB: { label: "GitHub", icon: "⌥", color: "#333333", placeholder: "username" },
  TELEGRAM: { label: "Telegram", icon: "✈", color: "#2AABEE", placeholder: "username" },
  DISCORD: { label: "Discord", icon: "◉", color: "#5865F2", placeholder: "username#0000" },
  YOUTUBE: { label: "YouTube", icon: "▶", color: "#FF0000", placeholder: "@channel" },
  INSTAGRAM: { label: "Instagram", icon: "◈", color: "#E1306C", placeholder: "username" },
  WEBSITE: { label: "Website", icon: "◎", color: "#0066FF", placeholder: "https://yoursite.com" },
  LINKEDIN: { label: "LinkedIn", icon: "in", color: "#0077B5", placeholder: "username" },
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
