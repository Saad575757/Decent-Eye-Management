"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { toPng } from "html-to-image";
import { MessageCircle, Printer, ImageDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const COUNTRY_CODE = "92";
const NATIONAL_MOBILE = /^3\d{9}$/;

function toWaNumber(raw: string): string | null {
  let digits = raw.trim().replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    const national = digits.slice(1);
    if (!NATIONAL_MOBILE.test(national)) return null;
    return COUNTRY_CODE + national;
  } else if (digits.length === 10 && NATIONAL_MOBILE.test(digits)) {
    return COUNTRY_CODE + digits;
  }

  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function WhatsAppSend({
  message,
  recipients = [],
  printLabel,
  downloadName,
  children,
}: {
  message: string;
  recipients?: string[];
  printLabel: string;
  downloadName: string;
  children: ReactNode;
}) {
  const docRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const parsed = Array.from(
    new Set(
      recipients
        .map((p) => p?.trim())
        .filter((p): p is string => !!p)
    )
  ).map((raw) => ({ raw, wa: toWaNumber(raw) }));
  const targets = Array.from(
    new Set(parsed.flatMap((t) => (t.wa ? [t.wa] : [])))
  );
  const invalid = parsed.flatMap((t) => (t.wa ? [] : [t.raw]));
  const encoded = encodeURIComponent(message);

  function openWhatsApp() {
    if (invalid.length) {
      alert(
        `This number is not a valid WhatsApp number:\n${invalid.join("\n")}\n\n` +
          "Check the customer's phone/WhatsApp number, or use Download Image and send it manually."
      );
      return false;
    }
    if (!targets.length) {
      alert(
        "No WhatsApp number is saved for this customer. " +
          "Add a phone/WhatsApp number first, or use Download Image and send it manually."
      );
      return false;
    }
    targets.forEach((num) => {
      window.open(
        `https://wa.me/${num}?text=${encoded}`,
        "_blank",
        "noopener"
      );
    });
    return true;
  }

  async function renderPng(): Promise<Blob | null> {
    const node = docRef.current;
    if (!node) return null;
    await document.fonts?.ready;
    const rect = node.getBoundingClientRect();
    const width = Math.ceil(Math.max(rect.width, node.scrollWidth));
    const height = Math.ceil(Math.max(rect.height, node.scrollHeight));
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      width,
      height,
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
    if (!openWhatsApp()) {
      setBusy(false);
      return;
    }
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
