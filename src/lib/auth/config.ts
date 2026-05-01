// src/lib/auth/config.ts
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    // Email + password
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.email) return null;

        // For OAuth users without password
        const storedHash = (user as any).passwordHash;
        if (!storedHash) return null;

        const valid = await bcrypt.compare(credentials.password, storedHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
        };
      },
    }),

    // Wallet signature auth
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.address ||
          !credentials?.signature ||
          !credentials?.message
        ) {
          return null;
        }

        // Verify signature
        try {
          const recovered = ethers.verifyMessage(
            credentials.message,
            credentials.signature
          );

          if (recovered.toLowerCase() !== credentials.address.toLowerCase()) {
            return null;
          }
        } catch {
          return null;
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { walletAddress: credentials.address },
        });

        if (!user) {
          const shortAddr = `${credentials.address.slice(0, 6)}...${credentials.address.slice(-4)}`;
          user = await prisma.user.create({
            data: {
              walletAddress: credentials.address,
              name: shortAddr,
              username: `user_${credentials.address.slice(2, 10).toLowerCase()}`,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
          walletAddress: user.walletAddress,
        };
      },
    }),

    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.walletAddress = (user as any).walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).walletAddress = token.walletAddress as string;
      }
      return session;
    },
  },
};
