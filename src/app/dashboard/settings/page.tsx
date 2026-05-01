// src/app/dashboard/settings/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/tip/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, username: true, walletAddress: true,
      isPublic: true, acceptingTips: true, defaultToken: true, minTipAmount: true,
      circleWalletId: true,
    },
  });

  if (!user) redirect("/auth/login");
  return <SettingsClient user={user as any} />;
}
