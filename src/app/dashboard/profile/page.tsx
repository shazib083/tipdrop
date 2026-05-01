// src/app/dashboard/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/tip/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, socialLinks: true },
  });

  if (!user) redirect("/auth/login");
  return <ProfileClient user={user as any} />;
}
