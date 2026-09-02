"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/types";
import {
  ProductSelector,
  type SelectableProduct,
} from "@/components/orders/ProductSelector";
import {
  PrescriptionForm,
  getEmptyPrescription,
  type PrescriptionValues,
} from "@/components/orders/PrescriptionForm";

const CATEGORY_LABELS: Record<string, string> = {
  FRAME: "Frame",
  GLASS: "Glass",
  LENS: "Lens",
  SUNGLASSES: "Sunglasses",
  SOLUTION: "Solution",
  CONTACT_LENS: "Contact Lens",
  ACCESSORY: "Accessory",
};

const MEMBER_CATEGORIES = [
  "FRAME",
  "GLASS",
  "SUNGLASSES",
  "SOLUTION",
  "CONTACT_LENS",
];

const FRAME_TYPES = [
  "Sheet Frame",
  "Sheet Branded Frame",
  "Metal Frame",
  "Metal Branded Frame",
  "Other",
];

const SUNGLASS_TYPES = ["Fancy", "Brand", "Other"];

const CONTACT_LENS_TYPES = ["Other"];

const CATEGORY_TYPES: Record<string, string[]> = {
  FRAME: FRAME_TYPES,
  SUNGLASSES: SUNGLASS_TYPES,
  CONTACT_LENS: CONTACT_LENS_TYPES,
};

const PRESCRIPTION_CATEGORIES = ["FRAME", "LENS", "SUNGLASSES", "CONTACT_LENS"];

export interface NewFamilyMember {
  name: string;
  phone: string;
  items: CartItem[];
  prescription: PrescriptionValues;
}

export function FamilyMemberDialog({
  open,
  onOpenChange,
  categories,
  productsByCategory,
  currency,
  onAddMember,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  productsByCategory: Record<string, SelectableProduct[]>;
  currency: string;
  onAddMember: (member: NewFamilyMember) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [prescription, setPrescription] = useState<PrescriptionValues>(
    getEmptyPrescription()
  );
  const [round, setRound] = useState(0);

  const hasRxItem = items.some((i) => PRESCRIPTION_CATEGORIES.includes(i.category));

  function reset() {
    setName("");
    setPhone("");
    setItems([]);
    setPrescription(getEmptyPrescription());
    setRound((r) => r + 1);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleAdd() {
    if (items.length === 0) return;
    onAddMember({ name: name.trim(), phone: phone.trim(), items, prescription });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Enter the member details and pick their items below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Wife / Son"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input
                placeholder="03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            {MEMBER_CATEGORIES.map((cat) => {
              const prods = productsByCategory[cat] || [];
              return (
                <div key={`${cat}-${round}`} className="rounded-lg border p-3">
                  <h4 className="mb-2 font-semibold">
                    {CATEGORY_LABELS[cat] || cat}
                  </h4>
                  {prods.length > 0 && (
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {prods.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setItems((prev) => [
                              ...prev,
                              {
                                productId: p.id,
                                productName: p.name,
                                category: cat,
                                quantity: 1,
                                price: p.sellingPrice,
                                total: p.sellingPrice,
                              },
                            ])
                          }
                          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {p.name}
                            </span>
                            {p.brand && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {p.brand}
                              </span>
                            )}
                          </span>
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatCurrency(p.sellingPrice, currency)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <ProductSelector
                    key={`${cat}-manual-${round}`}
                    title={`Add ${CATEGORY_LABELS[cat] || cat} manually`}
                    category={cat}
                    categoryLabel={CATEGORY_LABELS[cat] || cat}
                    products={productsByCategory[cat] || []}
                    currency={currency}
                    onAdd={(item) => setItems((prev) => [...prev, item])}
                    customPlaceholder={`${CATEGORY_LABELS[cat] || cat} Description`}
                    showQuantity
                    subTypes={CATEGORY_TYPES[cat]}
                    hideDescription
                  />
                </div>
              );
            })}
          </div>

          {items.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-semibold">Selected Items</p>
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productName}-${idx}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {item.productName}
                      {item.subType ? ` (${item.subType})` : ""} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.total, currency)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() =>
                        setItems((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasRxItem && (
            <div className="space-y-1.5 border-t pt-3">
              <p className="text-sm font-semibold">Eye Prescription</p>
              <PrescriptionForm
                values={prescription}
                onChange={setPrescription}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={items.length === 0}>
            <UserPlus className="mr-1 h-4 w-4" />
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
