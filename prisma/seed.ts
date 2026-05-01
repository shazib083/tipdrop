// prisma/seed.ts
import { PrismaClient, Platform, TipStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Demo user 1
  const alice = await prisma.user.upsert({
    where: { username: "alice" },
    update: {},
    create: {
      email: "alice@tipdrop.app",
      name: "Alice Chen",
      username: "alice",
      bio: "Full-stack developer & open source contributor. Love building cool things.",
      image: "https://ui-avatars.com/api/?name=Alice+Chen&background=00FF94&color=000",
      walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      isPublic: true,
      acceptingTips: true,
      totalReceived: 1250.50,
      totalTips: 47,
      profile: {
        create: {
          coverColor: "#0066FF",
          displayName: "Alice Chen",
          twitterHandle: "alicechen",
          githubHandle: "alicechen",
        },
      },
      socialLinks: {
        create: [
          { platform: Platform.TWITTER, handle: "alicechen", url: "https://twitter.com/alicechen" },
          { platform: Platform.GITHUB, handle: "alicechen", url: "https://github.com/alicechen" },
        ],
      },
    },
  });

  // Demo user 2
  const bob = await prisma.user.upsert({
    where: { username: "bob" },
    update: {},
    create: {
      email: "bob@tipdrop.app",
      name: "Bob Nakamoto",
      username: "bob",
      bio: "Crypto researcher & DeFi enthusiast. Teaching the world about Web3.",
      image: "https://ui-avatars.com/api/?name=Bob+Nakamoto&background=FF0099&color=fff",
      walletAddress: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      isPublic: true,
      acceptingTips: true,
      totalReceived: 3800.00,
      totalTips: 120,
      profile: {
        create: {
          coverColor: "#FF0099",
          displayName: "Bob Nakamoto",
          twitterHandle: "bobnakamoto",
          githubHandle: "bobnakamoto",
          telegramHandle: "bobnakamoto",
        },
      },
      socialLinks: {
        create: [
          { platform: Platform.TWITTER, handle: "bobnakamoto", url: "https://twitter.com/bobnakamoto" },
          { platform: Platform.TELEGRAM, handle: "bobnakamoto", url: "https://t.me/bobnakamoto" },
        ],
      },
    },
  });

  // Sample tips
  await prisma.tip.createMany({
    data: [
      {
        amount: 10,
        token: "USDC",
        message: "Great work on that tutorial!",
        status: TipStatus.CONFIRMED,
        senderId: bob.id,
        receiverId: alice.id,
        txHash: "0xabc123def456",
        confirmedAt: new Date(Date.now() - 86400000),
      },
      {
        amount: 25,
        token: "USDC",
        message: "Love your open source contributions!",
        status: TipStatus.CONFIRMED,
        senderId: alice.id,
        receiverId: bob.id,
        txHash: "0xdef789abc012",
        confirmedAt: new Date(Date.now() - 3600000),
      },
      {
        amount: 5,
        token: "USDC",
        isAnonymous: true,
        status: TipStatus.CONFIRMED,
        receiverId: alice.id,
        txHash: "0x111222333444",
        confirmedAt: new Date(Date.now() - 7200000),
      },
    ],
    skipDuplicates: true,
  });

  // Sample tip links
  await prisma.tipLink.createMany({
    data: [
      { slug: "alice", userId: alice.id, token: "USDC" },
      { slug: "bob", userId: bob.id, token: "USDC" },
      { slug: "alice-coffee", userId: alice.id, presetAmount: 5, token: "USDC", message: "Buy me a coffee ☕" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
  console.log(`   Users created: alice (id: ${alice.id}), bob (id: ${bob.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
