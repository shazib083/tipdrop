// src/app/api/tips/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { receiverId, amount, token, message, isAnonymous, fromAddress } = body;

    if (!receiverId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid tip data" }, { status: 400 });
    }
    if (amount < 0.01) {
      return NextResponse.json({ error: "Minimum tip is $0.01" }, { status: 400 });
    }
    if (amount > 10000) {
      return NextResponse.json({ error: "Maximum single tip is $10,000" }, { status: 400 });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, walletAddress: true, circleWalletId: true, acceptingTips: true },
    });
    if (!receiver) return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    if (!receiver.acceptingTips) return NextResponse.json({ error: "User is not accepting tips" }, { status: 403 });

    const senderId = (session?.user as any)?.id || null;

    // Create pending tip record
    const tip = await prisma.tip.create({
      data: {
        amount,
        token: token || "USDC",
        message: message?.trim() || null,
        isAnonymous: isAnonymous || false,
        status: "PENDING",
        senderId,
        receiverId,
        fromAddress: fromAddress || null,
        toAddress: receiver.walletAddress || null,
      },
    });

    // Determine payment route
    // Route 1: Both users have Circle wallets → server-side Circle transfer (fast)
    const sender = senderId
      ? await prisma.user.findUnique({ where: { id: senderId }, select: { circleWalletId: true } })
      : null;

    if (sender?.circleWalletId && receiver.circleWalletId) {
      // Update status to processing
      await prisma.tip.update({ where: { id: tip.id }, data: { status: "PROCESSING" } });

      try {
        const { circle } = await import("@/lib/circle");
        const transfer = await circle.transfer({
          amount,
          sourceWalletId: sender.circleWalletId,
          destinationWalletId: receiver.circleWalletId,
          idempotencyKey: tip.id,
        });

        await prisma.tip.update({
          where: { id: tip.id },
          data: {
            status: "CONFIRMED",
            circleTransferId: transfer.transferId,
            txHash: transfer.txHash || null,
            confirmedAt: new Date(),
          },
        });

        // Update receiver stats
        await prisma.user.update({
          where: { id: receiverId },
          data: {
            totalReceived: { increment: amount },
            totalTips: { increment: 1 },
          },
        });

        return NextResponse.json({
          success: true,
          data: { tipId: tip.id, txHash: transfer.txHash, method: "circle" },
        });
      } catch (circleErr) {
        console.error("[circle transfer]", circleErr);
        await prisma.tip.update({ where: { id: tip.id }, data: { status: "PENDING" } });
        // Fall through to wallet-direct flow
      }
    }

    // Route 2: External wallet → receiver's on-chain address (Arc)
    const usdcContract = process.env.NEXT_PUBLIC_USDC_CONTRACT;
    const toAddress = receiver.walletAddress;

    if (!toAddress) {
      return NextResponse.json({
        error: "Receiver has no wallet address configured. Ask them to connect their wallet.",
      }, { status: 400 });
    }

    // Return instructions for client-side signing
    return NextResponse.json({
      success: true,
      data: {
        tipId: tip.id,
        toAddress,
        usdcContract,
        amount,
        method: "wallet",
      },
    });
  } catch (err: unknown) {
    console.error("[tips/create]", err);
    return NextResponse.json({ error: "Failed to create tip" }, { status: 500 });
  }
}
