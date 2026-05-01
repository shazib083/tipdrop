// src/types/index.ts

export interface UserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  image?: string | null;
  walletAddress?: string | null;
  isPublic: boolean;
  acceptingTips: boolean;
  defaultToken: string;
  minTipAmount: number;
  totalReceived: number;
  totalTips: number;
  createdAt: Date;
  socialLinks: SocialLink[];
  profile?: ProfileDetails | null;
}

export interface ProfileDetails {
  id: string;
  coverColor: string;
  avatarBg: string;
  displayName?: string | null;
  location?: string | null;
  website?: string | null;
  twitterHandle?: string | null;
  githubHandle?: string | null;
  telegramHandle?: string | null;
}

export interface SocialLink {
  id: string;
  platform: Platform;
  handle: string;
  url: string;
}

export type Platform =
  | "TWITTER"
  | "GITHUB"
  | "TELEGRAM"
  | "DISCORD"
  | "YOUTUBE"
  | "INSTAGRAM"
  | "WEBSITE"
  | "LINKEDIN";

export interface Tip {
  id: string;
  amount: number;
  token: string;
  message?: string | null;
  isAnonymous: boolean;
  status: TipStatus;
  txHash?: string | null;
  fromAddress?: string | null;
  createdAt: Date;
  confirmedAt?: Date | null;
  sender?: Partial<UserProfile> | null;
  receiver?: Partial<UserProfile>;
}

export type TipStatus =
  | "PENDING"
  | "PROCESSING"
  | "CONFIRMED"
  | "FAILED"
  | "REFUNDED";

export interface TipFormData {
  amount: number;
  token: string;
  message?: string;
  isAnonymous?: boolean;
}

export interface TipLink {
  id: string;
  slug: string;
  userId: string;
  presetAmount?: number | null;
  token: string;
  message?: string | null;
  clickCount: number;
  tipCount: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date | null;
}

export interface DashboardStats {
  totalReceived: number;
  totalTips: number;
  weeklyReceived: number;
  monthlyReceived: number;
  averageTip: number;
  topSupporters: Array<{
    id: string;
    name: string;
    image?: string;
    totalSent: number;
    count: number;
  }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: number;
}

export interface NanopaymentBatch {
  id: string;
  batchId: string;
  totalAmount: number;
  tipCount: number;
  settled: boolean;
  settledAt?: Date | null;
  txHash?: string | null;
  createdAt: Date;
}
