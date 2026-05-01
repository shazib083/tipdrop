// src/app/api/arc/settle/route.ts
// Arc Nanopayment Batch Settlement
// This is called by a cron job (or manually) to settle accumulated micro-tips

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { arcClient } from "@/lib/arc";
import { v4 as uuidv4 } from "uuid";

// Protect with a cron secret
function verifyCronSecret(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all confirmed tips not yet settled on-chain
    const unsettledTips = await prisma.tip.findMany({
      where: {
        status: "CONFIRMED",
        arcPaymentId: null,
        txHash: null,
        receiver: { walletAddress: { not: null } },
      },
      include: {
        receiver: { select: { walletAddress: true } },
      },
      take: 100, // Process in batches of 100
    });

    if (unsettledTips.length === 0) {
      return NextResponse.json({ success: true, message: "No unsettled tips" });
    }

    // Group by receiver to minimise transactions
    const byReceiver: Record<string, { address: string; amount: number; tipIds: string[] }> = {};
    for (const tip of unsettledTips) {
      const addr = tip.receiver.walletAddress!;
      if (!byReceiver[addr]) {
        byReceiver[addr] = { address: addr, amount: 0, tipIds: [] };
      }
      byReceiver[addr].amount += tip.amount;
      byReceiver[addr].tipIds.push(tip.id);
    }

    const payments = Object.values(byReceiver).map((r) => ({
      address: r.address,
      amount: r.amount,
    }));

    const batchId = uuidv4();

    // Submit batch to Arc
    const { txHash, batchTotal } = await arcClient.submitNanopaymentBatch(payments);

    // Record batch
    await prisma.nanopaymentBatch.create({
      data: {
        batchId,
        totalAmount: batchTotal,
        tipCount: unsettledTips.length,
        settled: true,
        settledAt: new Date(),
        txHash,
      },
    });

    // Mark tips as settled
    const allTipIds = Object.values(byReceiver).flatMap((r) => r.tipIds);
    await prisma.tip.updateMany({
      where: { id: { in: allTipIds } },
      data: { arcBatchId: batchId },
    });

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        txHash,
        totalSettled: batchTotal,
        tipCount: unsettledTips.length,
        explorerUrl: arcClient.getTxExplorerUrl(txHash),
      },
    });
  } catch (err: unknown) {
    console.error("[arc/settle]", err);
    return NextResponse.json({ error: "Settlement failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batches = await prisma.nanopaymentBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ success: true, data: batches });
}
