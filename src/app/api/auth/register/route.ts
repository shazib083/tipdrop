// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import { isValidUsername } from "@/lib/utils";
import { circle } from "@/lib/circle";

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3–20 chars, letters/numbers/underscores only" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check uniqueness
    const [emailExists, usernameExists] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);
    if (emailExists) return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    if (usernameExists) return NextResponse.json({ error: "Username already taken" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        (passwordHash as any): passwordHash,
        profile: {
          create: {
            displayName: name,
            coverColor: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
          },
        },
      },
    });

    // Provision Circle wallet in background (don't block registration)
    circle.createWallet(user.id).then(async ({ walletId, address }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { circleWalletId: walletId, walletAddress: address },
      });
    }).catch(console.error);

    return NextResponse.json({ success: true, data: { id: user.id, username: user.username } });
  } catch (err: unknown) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
