"use client";

import { useState } from "react";
import Link from "next/link";
import { Glasses, Scan, Sun, Sparkles, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { key: "FRAME", label: "Frame", icon: Glasses, tile: "border-indigo-200 bg-indigo-50", chip: "bg-indigo-600 text-white", fill: "border-indigo-500 bg-indigo-500 ring-2 ring-indigo-500/30" },
  { key: "GLASS", label: "Glass", icon: Scan, tile: "border-teal-200 bg-teal-50", chip: "bg-teal-600 text-white", fill: "border-teal-500 bg-teal-500 ring-2 ring-teal-500/30" },
  { key: "SUNGLASSES", label: "Sunglass", icon: Sun, tile: "border-amber-200 bg-amber-50", chip: "bg-amber-600 text-white", fill: "border-amber-500 bg-amber-500 ring-2 ring-amber-500/30" },
  { key: "SOLUTION", label: "Solution", icon: Sparkles, tile: "border-sky-200 bg-sky-50", chip: "bg-sky-600 text-white", fill: "border-sky-500 bg-sky-500 ring-2 ring-sky-500/30" },
  { key: "CONTACT_LENS", label: "Contact Lens", icon: Circle, tile: "border-rose-200 bg-rose-50", chip: "bg-rose-600 text-white", fill: "border-rose-500 bg-rose-500 ring-2 ring-rose-500/30" },
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
              "group flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center shadow-sm transition-all",
              selected.has(c.key)
                ? cn("text-white", c.fill)
                : cn(c.tile, "hover:-translate-y-0.5 hover:shadow-md")
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full transition-all",
                selected.has(c.key)
                  ? "bg-white/25"
                  : cn(c.chip, "group-hover:scale-110")
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
          className="h-14 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-base font-bold shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
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
