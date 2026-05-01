// src/app/dashboard/links/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { LinksClient } from "@/components/tip/LinksClient";

export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  const userId = (session.user as any).id;

  const [links, user] = await Promise.all([
    prisma.tipLink.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { username: true } }),
  ]);

  return <LinksClient links={links as any} userId={userId} username={user?.username || ""} />;
}
