"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { toPng } from "html-to-image";
import { MessageCircle, Printer, ImageDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_RECIPIENT = "03484630117";

function toWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  return "92" + digits;
}

export function WhatsAppSend({
  message,
  recipients = [],
  shopWhatsapp,
  printLabel,
  downloadName,
  children,
}: {
  message: string;
  recipients?: string[];
  shopWhatsapp?: string | null;
  printLabel: string;
  downloadName: string;
  children: ReactNode;
}) {
  const docRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const targets = Array.from(
    new Set(
      [...recipients, shopWhatsapp || DEFAULT_RECIPIENT]
        .map((p) => p?.trim())
        .filter((p): p is string => !!p)
        .map(toWaNumber)
        .filter(Boolean)
    )
  );
  const encoded = encodeURIComponent(message);

  function openWhatsApp() {
    targets.forEach((num, i) => {
      window.open(
        `https://wa.me/${num}?text=${encoded}`,
        "_blank",
        "noopener"
      );
    });
  }

  async function renderPng(): Promise<Blob | null> {
    if (!docRef.current) return null;
    await document.fonts?.ready;
    const dataUrl = await toPng(docRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      style: {
        margin: "0",
        backgroundColor: "white",
      },
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  }

  function triggerDownload(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleSendWithImage() {
    if (busy) return;
    setBusy(true);
    openWhatsApp();
    try {
      const blob = await renderPng();
      let copied = false;
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          copied = true;
        } catch {
          triggerDownload(blob);
        }
      }
      if (copied) {
        alert(
          "The image is copied to your clipboard. " +
            "Paste (Ctrl+V) it in the WhatsApp chat and press send."
        );
      } else {
        alert(
          "The image was downloaded. Attach it manually in the WhatsApp chat and send."
        );
      }
    } catch (err) {
      console.error(err);
      alert("Could not generate the image. Sharing text only.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 print:hidden">
        <Button
          onClick={() => window.print()}
          className="print:hidden"
        >
          <Printer className="h-4 w-4" />
          {printLabel}
        </Button>
        <Button
          onClick={handleSendWithImage}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          Send with Image
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const blob = await renderPng();
            if (blob) triggerDownload(blob);
          }}
        >
          <ImageDown className="h-4 w-4" />
          Download Image
        </Button>
      </div>

      <div className="mt-4 flex justify-center print:mt-0">
        <div ref={docRef}>{children}</div>
      </div>
    </div>
  );
}
