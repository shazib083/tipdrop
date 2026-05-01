// src/app/api/links/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const link = await prisma.tipLink.findUnique({ where: { id: params.id } });
    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
    if (link.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.tipLink.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[links/delete]", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as any).id;

    const link = await prisma.tipLink.findUnique({ where: { id: params.id } });
    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
    if (link.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const updated = await prisma.tipLink.update({
      where: { id: params.id },
      data: {
        ...(body.presetAmount !== undefined && { presetAmount: body.presetAmount }),
        ...(body.message !== undefined && { message: body.message }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[links/patch]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
