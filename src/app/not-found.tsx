// src/app/not-found.tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display font-black text-6xl mb-4 text-gradient">404</h1>
        <h2 className="font-display font-bold text-2xl mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          This page doesn't exist or the tip link has expired.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go home
            </Link>
          </Button>
          <Button asChild className="neon-glow">
            <Link href="/auth/register">Create your tip page</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
