// src/app/api/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { isValidUsername } from "@/lib/utils";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const body = await req.json();
    const { name, username, bio, displayName, location, website, coverColor, socialLinks } = body;

    if (username && !isValidUsername(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Check username uniqueness
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: userId } },
      });
      if (existing) return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Upsert profile
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(username && { username }),
          ...(bio !== undefined && { bio }),
        },
      });

      await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          ...(displayName && { displayName }),
          ...(location && { location }),
          ...(website && { website }),
          ...(coverColor && { coverColor }),
        },
        update: {
          ...(displayName !== undefined && { displayName }),
          ...(location !== undefined && { location }),
          ...(website !== undefined && { website }),
          ...(coverColor && { coverColor }),
        },
      });

      // Replace social links
      if (Array.isArray(socialLinks)) {
        await tx.socialLink.deleteMany({ where: { userId } });
        if (socialLinks.length > 0) {
          await tx.socialLink.createMany({
            data: socialLinks.map((l: any) => ({
              userId,
              platform: l.platform,
              handle: l.handle,
              url: l.url,
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[profile/update]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
