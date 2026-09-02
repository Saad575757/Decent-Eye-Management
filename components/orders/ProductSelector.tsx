"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
  categoryLabel?: string;
  products: SelectableProduct[];
  currency: string;
  onAdd: (item: CartItem) => void;
  customPlaceholder?: string;
  showQuantity?: boolean;
  subTypes?: string[];
  hideDescription?: boolean;
  resetKey?: string | number;
}

export function ProductSelector({
  title,
  category,
  categoryLabel,
  products,
  currency,
  onAdd,
  customPlaceholder,
  showQuantity = false,
  subTypes,
  hideDescription = false,
  resetKey,
}: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");
  const [subType, setSubType] = useState("");
  const [otherSubType, setOtherSubType] = useState("");

  function handleAdd() {
    const trimmedName = name.trim() || categoryLabel || `${title} Item`;
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      alert("Please enter a valid price.");
      return;
    }
    const quantity = showQuantity ? Math.max(1, parseInt(qty) || 1) : 1;
    const selectedSubType = subType === "Other" ? otherSubType.trim() || subType : subType;
    onAdd({
      productName: trimmedName,
      category,
      subType: selectedSubType || undefined,
      quantity,
      price: numPrice,
      total: numPrice * quantity,
    });
    setName("");
    setPrice("");
    setQty("1");
    setSubType("");
    setOtherSubType("");
  }

  return (
    <div className="space-y-3 rounded-lg border p-4" key={resetKey}>
      <h3 className="font-semibold">{title}</h3>

      <div className="space-y-3">
        {!hideDescription && (
          <div className="space-y-1.5">
            <Label>{customPlaceholder || `${title} Description`}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter description"
            />
          </div>
        )}

        {subTypes && (
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {subTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSubType(t)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs transition-colors",
                    subType === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            {subType === "Other" && (
              <Input
                value={otherSubType}
                onChange={(e) => setOtherSubType(e.target.value)}
                placeholder="Specify type..."
                className="mt-2"
              />
            )}
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label>Price ({currency})</Label>
            <Input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-32"
            />
          </div>
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
        </div>

        <Button type="button" onClick={handleAdd} className="w-full">
          Add to Order
        </Button>
      </div>
    </div>
  );
}
