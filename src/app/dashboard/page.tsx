// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { DashboardClient } from "@/components/tip/DashboardClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  const [user, tipsReceived, tipsSent, recentTips] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, socialLinks: true },
    }),
    prisma.tip.aggregate({
      where: { receiverId: userId, status: "CONFIRMED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.tip.aggregate({
      where: { senderId: userId, status: "CONFIRMED" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.tip.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
  ]);

  // Weekly stats
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTips = await prisma.tip.aggregate({
    where: { receiverId: userId, status: "CONFIRMED", createdAt: { gte: weekAgo } },
    _sum: { amount: true },
    _count: true,
  });

  // Monthly stats
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyTips = await prisma.tip.aggregate({
    where: { receiverId: userId, status: "CONFIRMED", createdAt: { gte: monthAgo } },
    _sum: { amount: true },
  });

  return {
    user,
    stats: {
      totalReceived: tipsReceived._sum.amount || 0,
      totalTips: tipsReceived._count,
      totalSent: tipsSent._sum.amount || 0,
      tipsSent: tipsSent._count,
      weeklyReceived: weeklyTips._sum.amount || 0,
      weeklyTips: weeklyTips._count,
      monthlyReceived: monthlyTips._sum.amount || 0,
      averageTip:
        tipsReceived._count > 0
          ? (tipsReceived._sum.amount || 0) / tipsReceived._count
          : 0,
    },
    recentTips,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as any).id;
  const data = await getDashboardData(userId);

  return <DashboardClient data={data} userId={userId} />;
}
