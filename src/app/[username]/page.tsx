// src/app/[username]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { TipPageClient } from "@/components/tip/TipPageClient";
import type { Metadata } from "next";

interface Props {
  params: { username: string };
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username, isPublic: true },
    include: {
      profile: true,
      socialLinks: true,
      tipsReceived: {
        where: { status: "CONFIRMED", isAnonymous: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          amount: true,
          token: true,
          message: true,
          createdAt: true,
          sender: { select: { name: true, username: true, image: true } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.username);
  if (!user) return { title: "Not found" };
  const name = user.profile?.displayName || user.name || params.username;
  return {
    title: `Tip ${name} on TipDrop`,
    description: user.bio || `Send ${name} a crypto tip on TipDrop.`,
    openGraph: {
      title: `Tip ${name} on TipDrop`,
      description: user.bio || `Send ${name} a crypto tip.`,
      images: [user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400`],
    },
  };
}

export default async function TipPage({ params }: Props) {
  const user = await getUser(params.username);
  if (!user || !user.acceptingTips) notFound();
  return <TipPageClient user={user as any} />;
}
