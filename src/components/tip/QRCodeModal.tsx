// src/components/tip/QRCodeModal.tsx
"use client";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

interface Props {
  open: boolean;
  onClose: () => void;
  url: string;
  username?: string | null;
}

export function QRCodeModal({ open, onClose, url, username }: Props) {
  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const a = document.createElement("a");
      a.download = `tipdrop-${username || "qr"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", variant: "success" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Your QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6">
          <div className="p-6 bg-white rounded-2xl shadow-inner">
            <QRCodeSVG
              ref={qrRef}
              value={url}
              size={220}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "",
                height: 0,
                width: 0,
                excavate: false,
              }}
            />
          </div>

          <div className="w-full text-center">
            <p className="text-sm font-mono text-muted-foreground truncate">{url}</p>
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 gap-2" onClick={copyUrl}>
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
            <Button className="flex-1 gap-2" onClick={downloadQR}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Share this QR code anywhere to receive crypto tips
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
