// src/app/dashboard/analytics/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "@/components/tip/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  const userId = (session.user as any).id;

  // Get 30 days of daily tip data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const tips = await prisma.tip.findMany({
    where: { receiverId: userId, status: "CONFIRMED", createdAt: { gte: thirtyDaysAgo } },
    orderBy: { createdAt: "asc" },
    select: { amount: true, token: true, createdAt: true },
  });

  // Build daily series
  const dailyMap: Record<string, { date: string; amount: number; count: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { date: key, amount: 0, count: 0 };
  }
  for (const tip of tips) {
    const key = new Date(tip.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key]) {
      dailyMap[key].amount += tip.amount;
      dailyMap[key].count += 1;
    }
  }

  // Token breakdown
  const tokenMap: Record<string, number> = {};
  for (const tip of tips) {
    tokenMap[tip.token] = (tokenMap[tip.token] || 0) + tip.amount;
  }

  return (
    <AnalyticsClient
      dailyData={Object.values(dailyMap)}
      tokenData={Object.entries(tokenMap).map(([token, amount]) => ({ token, amount }))}
      totalTips={tips.length}
      totalAmount={tips.reduce((s, t) => s + t.amount, 0)}
    />
  );
}
