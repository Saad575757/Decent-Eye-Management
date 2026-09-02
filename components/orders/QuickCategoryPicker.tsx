"use client";

import { useState } from "react";
import Link from "next/link";
import { Glasses, Scan, Sun, Sparkles, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { key: "FRAME", label: "Frame", icon: Glasses },
  { key: "GLASS", label: "Glass", icon: Scan },
  { key: "SUNGLASSES", label: "Sunglass", icon: Sun },
  { key: "SOLUTION", label: "Solution", icon: Sparkles },
  { key: "CONTACT_LENS", label: "Contact Lens", icon: Circle },
] as const;

export function QuickCategoryPicker() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const href =
    selected.size > 0
      ? `/orders/new/quick?categories=${Array.from(selected).join(",")}`
      : "#";

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        Quick Order
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => toggle(c.key)}
            className={cn(
              "group flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm transition-all",
              selected.has(c.key)
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "hover:border-primary/50 hover:bg-accent"
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                selected.has(c.key)
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 group-hover:bg-primary/20"
              )}
            >
              <c.icon className="h-7 w-7" />
            </div>
            <span className="text-base font-semibold">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Button
          asChild
          size="lg"
          className="w-full h-14 text-base"
          disabled={selected.size === 0}
        >
          <Link
            href={href}
            onClick={(e) => {
              if (selected.size === 0) e.preventDefault();
            }}
          >
            {selected.size > 0
              ? `Select (${selected.size} ${selected.size === 1 ? "category" : "categories"})`
              : "Select categories to order"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
