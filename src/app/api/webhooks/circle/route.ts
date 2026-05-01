// src/app/api/webhooks/circle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { circle } from "@/lib/circle";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-circle-signature") || "";

    // Verify webhook signature
    if (!circle.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    if (type === "payments.payment_confirmed" || type === "transfers.transfer_confirmed") {
      const { id: circleId, transactionHash, state } = data;

      if (state !== "complete" && state !== "confirmed") {
        return NextResponse.json({ received: true });
      }

      // Find tip by Circle transfer ID
      const tip = await prisma.tip.findFirst({
        where: {
          OR: [
            { circleTransferId: circleId },
            { circlePaymentId: circleId },
          ],
        },
      });

      if (tip && tip.status !== "CONFIRMED") {
        await prisma.$transaction([
          prisma.tip.update({
            where: { id: tip.id },
            data: {
              status: "CONFIRMED",
              txHash: transactionHash || null,
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
      }
    }

    if (type === "payments.payment_failed" || type === "transfers.transfer_failed") {
      const { id: circleId } = data;
      const tip = await prisma.tip.findFirst({
        where: {
          OR: [
            { circleTransferId: circleId },
            { circlePaymentId: circleId },
          ],
        },
      });
      if (tip) {
        await prisma.tip.update({
          where: { id: tip.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook/circle]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
