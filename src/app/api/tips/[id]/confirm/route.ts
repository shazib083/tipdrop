// src/app/api/tips/[id]/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { arcClient } from "@/lib/arc";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { txHash, blockNumber } = await req.json();
    const tipId = params.id;

    if (!txHash) return NextResponse.json({ error: "txHash required" }, { status: 400 });

    const tip = await prisma.tip.findUnique({ where: { id: tipId } });
    if (!tip) return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    if (tip.status === "CONFIRMED") {
      return NextResponse.json({ success: true, data: { already: true } });
    }

    // Verify on-chain
    const verification = await arcClient.verifyTransaction(txHash);

    if (!verification.confirmed) {
      // Mark as processing — will be confirmed by webhook/polling
      await prisma.tip.update({
        where: { id: tipId },
        data: { status: "PROCESSING", txHash, blockNumber: blockNumber ? BigInt(blockNumber) : null },
      });
      return NextResponse.json({
        success: true,
        data: { status: "processing", message: "Transaction submitted, awaiting confirmation" },
      });
    }

    // Confirmed — update tip and receiver stats
    await prisma.$transaction([
      prisma.tip.update({
        where: { id: tipId },
        data: {
          status: "CONFIRMED",
          txHash,
          blockNumber: blockNumber ? BigInt(blockNumber) : null,
          fromAddress: verification.from || tip.fromAddress,
          confirmedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: tip.receiverId },
        data: {
          totalReceived: { increment: tip.amount },
          totalTips: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        status: "confirmed",
        txHash,
        explorerUrl: arcClient.getTxExplorerUrl(txHash),
      },
    });
  } catch (err: unknown) {
    console.error("[tips/confirm]", err);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
