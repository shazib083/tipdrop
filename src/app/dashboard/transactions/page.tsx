// src/app/dashboard/transactions/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { TransactionsClient } from "@/components/tip/TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  const userId = (session.user as any).id;

  const [received, sent] = await Promise.all([
    prisma.tip.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
    prisma.tip.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        receiver: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
  ]);

  return <TransactionsClient received={received as any} sent={sent as any} />;
}
