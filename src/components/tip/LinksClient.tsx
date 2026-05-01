// src/components/tip/LinksClient.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Plus, Trash2, QrCode, ExternalLink, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QRCodeModal } from "@/components/tip/QRCodeModal";
import { toast } from "@/components/ui/toaster";
import { formatAmount, formatDate } from "@/lib/utils";
import type { TipLink } from "@/types";

interface Props { links: TipLink[]; userId: string; username: string; }

export function LinksClient({ links: initialLinks, userId, username }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrLink, setQrLink] = useState<TipLink | null>(null);
  const [newLink, setNewLink] = useState({ slug: "", presetAmount: "", message: "" });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tipdrop.app";

  const copy = (link: TipLink) => {
    navigator.clipboard.writeText(`${appUrl}/${link.slug}`);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const createLink = async () => {
    if (!newLink.slug.trim()) {
      toast({ title: "Slug is required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newLink.slug.trim(),
          presetAmount: newLink.presetAmount ? parseFloat(newLink.presetAmount) : undefined,
          message: newLink.message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLinks((prev) => [data.data, ...prev]);
      setShowCreate(false);
      setNewLink({ slug: "", presetAmount: "", message: "" });
      toast({ title: "Link created! ✓", variant: "success" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await fetch(`/api/links/${id}`, { method: "DELETE" });
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Link deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl">Tip Links</h1>
          <p className="text-muted-foreground mt-1">Create custom tip links with preset amounts</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 neon-glow">
          <Plus className="w-4 h-4" />
          New link
        </Button>
      </div>

      {/* Default link */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Your default tip page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm font-mono text-primary bg-background rounded-lg px-3 py-2 border border-border truncate">
              {appUrl}/{username}
            </code>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`${appUrl}/${username}`); toast({ title: "Copied!" }); }}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/${username}`} target="_blank"><ExternalLink className="w-4 h-4" /></a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom links */}
      {links.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Link2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">No custom links yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create links with preset amounts for specific campaigns</p>
            <Button size="sm" onClick={() => setShowCreate(true)}>Create your first link</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link, i) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-primary">{appUrl}/{link.slug}</code>
                        <Badge variant={link.isActive ? "success" : "outline"} className="text-xs">
                          {link.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {link.presetAmount && <span>Preset: ${formatAmount(link.presetAmount)}</span>}
                        {link.message && <span>"{link.message}"</span>}
                        <span>{link.clickCount} clicks</span>
                        <span>{link.tipCount} tips</span>
                        <span>Created {formatDate(link.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => copy(link)}>
                        {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setQrLink(link)}>
                        <QrCode className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8" asChild>
                        <a href={`/${link.slug}`} target="_blank"><ExternalLink className="w-3.5 h-3.5" /></a>
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => deleteLink(link.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create tip link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Slug</Label>
              <div className="flex items-center gap-0 mt-1.5">
                <span className="px-3 py-2 bg-muted border border-r-0 border-input rounded-l-xl text-sm text-muted-foreground">{appUrl}/</span>
                <Input
                  className="rounded-l-none"
                  placeholder="my-link"
                  value={newLink.slug}
                  onChange={(e) => setNewLink({ ...newLink, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                />
              </div>
            </div>
            <div>
              <Label>Preset amount (optional)</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  className="pl-7"
                  placeholder="e.g. 5, 10, 25"
                  value={newLink.presetAmount}
                  onChange={(e) => setNewLink({ ...newLink, presetAmount: e.target.value })}
                  min="0.01"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pre-fills the tip amount when visitors open the link</p>
            </div>
            <div>
              <Label>Message (optional)</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Buy me a coffee ☕"
                value={newLink.message}
                onChange={(e) => setNewLink({ ...newLink, message: e.target.value })}
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createLink} disabled={creating} className="gap-2">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {qrLink && (
        <QRCodeModal
          open={!!qrLink}
          onClose={() => setQrLink(null)}
          url={`${appUrl}/${qrLink.slug}`}
          username={qrLink.slug}
        />
      )}
    </div>
  );
}
