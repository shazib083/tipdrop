// src/components/tip/ProfileClient.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Plus, Trash2, AtSign, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toaster";
import { PLATFORMS } from "@/lib/utils";
import type { UserProfile, Platform } from "@/types";

interface Props { user: UserProfile; }

const PLATFORM_LIST = Object.entries(PLATFORMS) as [Platform, typeof PLATFORMS[keyof typeof PLATFORMS]][];

export function ProfileClient({ user }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    displayName: user.profile?.displayName || "",
    location: user.profile?.location || "",
    website: user.profile?.website || "",
    coverColor: user.profile?.coverColor || "#0066FF",
  });
  const [socialLinks, setSocialLinks] = useState(
    user.socialLinks.map((l) => ({ platform: l.platform, handle: l.handle, url: l.url }))
  );
  const [newLink, setNewLink] = useState({ platform: "TWITTER" as Platform, handle: "" });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, socialLinks }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }
      toast({ title: "Profile saved! ✓", variant: "success" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    if (!newLink.handle.trim()) return;
    const info = PLATFORMS[newLink.platform];
    const url = info
      ? newLink.platform === "WEBSITE"
        ? newLink.handle
        : `https://${newLink.platform === "TWITTER" ? "twitter.com" : newLink.platform === "GITHUB" ? "github.com" : "t.me"}/${newLink.handle}`
      : "";
    setSocialLinks((prev) => [
      ...prev.filter((l) => l.platform !== newLink.platform),
      { platform: newLink.platform, handle: newLink.handle, url },
    ]);
    setNewLink({ platform: "TWITTER", handle: "" });
  };

  const removeSocialLink = (platform: Platform) => {
    setSocialLinks((prev) => prev.filter((l) => l.platform !== platform));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl">Profile</h1>
        <p className="text-muted-foreground mt-1">Customise your public tip page</p>
      </div>

      {/* Avatar preview */}
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback
                className="text-2xl font-display font-bold"
                style={{ background: form.coverColor, color: "#fff" }}
              >
                {(form.displayName || form.name || "U")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="font-semibold">{form.displayName || form.name || "Your Name"}</p>
            <p className="text-sm text-muted-foreground font-mono">@{form.username || "username"}</p>
            <p className="text-xs text-muted-foreground mt-1">tipdrop.app/{form.username || "username"}</p>
          </div>
          <div className="ml-auto">
            <input
              type="color"
              value={form.coverColor}
              onChange={(e) => setForm({ ...form, coverColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border border-border"
              title="Cover color"
            />
            <p className="text-xs text-muted-foreground text-center mt-1">Cover</p>
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                className="mt-1.5"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Satoshi Nakamoto"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative mt-1.5">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                  placeholder="satoshi"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              className="mt-1.5 h-24"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell supporters who you are and what you do..."
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground mt-1">{form.bio.length}/500</div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              className="mt-1.5"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="San Francisco, CA"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <div className="relative mt-1.5">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="website"
                className="pl-9"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social links */}
      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Add links to your social profiles to build trust with supporters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing links */}
          {socialLinks.map((link) => {
            const info = PLATFORMS[link.platform as keyof typeof PLATFORMS];
            return (
              <div key={link.platform} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: info?.color || "#666" }}
                >
                  {info?.icon || link.platform[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{info?.label || link.platform}</p>
                  <p className="text-xs text-muted-foreground font-mono">{link.handle}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSocialLink(link.platform as Platform)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}

          {/* Add new */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <select
              value={newLink.platform}
              onChange={(e) => setNewLink({ ...newLink, platform: e.target.value as Platform })}
              className="flex h-10 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {PLATFORM_LIST.map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <Input
              placeholder={PLATFORMS[newLink.platform]?.placeholder || "username"}
              value={newLink.handle}
              onChange={(e) => setNewLink({ ...newLink, handle: e.target.value })}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addSocialLink()}
            />
            <Button variant="outline" size="icon" onClick={addSocialLink}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2 neon-glow">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
