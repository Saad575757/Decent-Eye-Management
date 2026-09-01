"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

export interface SelectableProduct {
  id: string;
  name: string;
  brand: string | null;
  sellingPrice: number;
  stock: number;
}

interface Props {
  title: string;
  category: string;
  products: SelectableProduct[];
  currency: string;
  onAdd: (item: CartItem) => void;
  customPlaceholder?: string;
  showQuantity?: boolean;
  lensTypes?: string[];
  onCustomLensType?: (type: string) => void;
}

export function ProductSelector({
  title,
  category,
  products,
  currency,
  onAdd,
  customPlaceholder,
  showQuantity = false,
  lensTypes,
  onCustomLensType,
}: Props) {
  const [mode, setMode] = useState<"existing" | "custom">("existing");
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState("1");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [lensType, setLensType] = useState("");

  const filtered = products.filter(
    (p) => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected =
    products.find((p) => p.id === selectedId) || filtered[0] || null;

  function addExisting() {
    if (!selected) return;
    const quantity = showQuantity ? Math.max(1, parseInt(qty) || 1) : 1;
    if (selected.stock < quantity) {
      alert(`Insufficient stock. Available: ${selected.stock}`);
      return;
    }
    onAdd({
      productId: selected.id,
      productName: selected.name,
      category,
      quantity,
      price: selected.sellingPrice,
      total: selected.sellingPrice * quantity,
    });
  }

  function addCustom() {
    const name = customName.trim();
    const price = parseFloat(customPrice);
    if (!name || isNaN(price) || price < 0) {
      alert("Please enter a description and a valid price.");
      return;
    }
    onAdd({
      productName: name,
      category,
      quantity: 1,
      price,
      total: price,
    });
    setCustomName("");
    setCustomPrice("");
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-1 rounded-md bg-muted p-0.5">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              mode === "existing"
                ? "bg-background shadow"
                : "text-muted-foreground"
            )}
          >
            Select Existing
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              mode === "custom"
                ? "bg-background shadow"
                : "text-muted-foreground"
            )}
          >
            Add Custom
          </button>
        </div>
      </div>

      {mode === "existing" ? (
        <div className="space-y-3">
          <Input
            type="search"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedId("");
            }}
          />
          {filtered.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              No products found. Use "Add Custom" instead.
            </p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors",
                    selected?.id === p.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.brand ? `${p.brand} • ` : ""}
                      {formatCurrency(p.sellingPrice, currency)} • Stock:{" "}
                      {p.stock}
                    </div>
                  </div>
                  {selected?.id === p.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
          {showQuantity && (
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-24"
              />
            </div>
          )}
          {lensTypes && (
            <div className="space-y-1.5">
              <Label>Lens Type</Label>
              <div className="flex flex-wrap gap-1.5">
                {lensTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLensType(t)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs transition-colors",
                      lensType === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button
            type="button"
            disabled={!selected}
            onClick={addExisting}
            className="w-full"
          >
            Add to Order
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{customPlaceholder || `${title} Description`}</Label>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Custom metal frame"
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="6000"
                className="w-32"
              />
            </div>
          </div>
          <Button type="button" onClick={addCustom} className="w-full">
            Add Custom to Order
          </Button>
        </div>
      )}
    </div>
  );
}
