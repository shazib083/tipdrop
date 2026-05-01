// src/app/api/settings/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const { isPublic, acceptingTips, defaultToken, minTipAmount } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isPublic !== undefined && { isPublic }),
        ...(acceptingTips !== undefined && { acceptingTips }),
        ...(defaultToken && { defaultToken }),
        ...(minTipAmount !== undefined && { minTipAmount: Math.max(0.01, parseFloat(minTipAmount) || 0.1) }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[settings/update]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
