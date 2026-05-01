// src/app/api/users/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username, isPublic: true },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        totalReceived: true,
        totalTips: true,
        acceptingTips: true,
        createdAt: true,
        profile: {
          select: { displayName: true, coverColor: true, location: true, website: true },
        },
        socialLinks: {
          select: { platform: true, handle: true, url: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error("[users/get]", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
