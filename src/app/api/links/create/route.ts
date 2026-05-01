// src/app/api/links/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const { slug, presetAmount, message, token } = await req.json();

    if (!slug || !/^[a-z0-9-]{2,50}$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be 2–50 chars, lowercase letters/numbers/hyphens" },
        { status: 400 }
      );
    }

    const existing = await prisma.tipLink.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });

    const link = await prisma.tipLink.create({
      data: {
        slug,
        userId,
        presetAmount: presetAmount || null,
        message: message || null,
        token: token || "USDC",
      },
    });

    return NextResponse.json({ success: true, data: link });
  } catch (err: unknown) {
    console.error("[links/create]", err);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
