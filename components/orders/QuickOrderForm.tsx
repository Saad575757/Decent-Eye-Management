"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { createQuickOrderAction } from "@/lib/actions";
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
import {
  FamilyMemberDialog,
  type NewFamilyMember,
} from "@/components/orders/FamilyMemberDialog";

const CATEGORY_LABELS: Record<string, string> = {
  FRAME: "Frame",
  GLASS: "Glass",
  LENS: "Lens",
  SUNGLASSES: "Sunglasses",
  SOLUTION: "Solution",
  CONTACT_LENS: "Contact Lens",
  ACCESSORY: "Accessory",
};

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

interface FamilyMember {
  key: number;
  name: string;
  phone: string;
}

interface QuickOrderFormProps {
  categories: string[];
  productsByCategory: Record<string, SelectableProduct[]>;
  currency: string;
}

export function QuickOrderForm({
  categories,
  productsByCategory,
  currency,
}: QuickOrderFormProps) {
  const [customerPhone, setCustomerPhone] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [advance, setAdvance] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState<PrescriptionValues>(
    getEmptyPrescription()
  );
  const [familyPrescriptions, setFamilyPrescriptions] = useState<
    PrescriptionValues[]
  >([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const memberIdRef = useRef(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const advanceNum = Math.max(0, parseFloat(advance) || 0);
  const balance = subtotal - Math.min(advanceNum, subtotal);

  const hasPrescriptionItem = items.some((i) =>
    PRESCRIPTION_CATEGORIES.includes(i.category)
  );

  function customerNameFor(index: number) {
    if (index === 0) return customerPhone.trim() || "Customer 1";
    const m = familyMembers[index - 1];
    if (m) {
      return m.name.trim() || m.phone.trim() || `Family Member ${index}`;
    }
    return `Family Member ${index}`;
  }

  function customerHasRxItem(index: number) {
    return items.some(
      (i) =>
        parseInt(i.customerId || "0", 10) === index &&
        PRESCRIPTION_CATEGORIES.includes(i.category)
    );
  }

  function addItemFor(index: number, item: CartItem) {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        customerId: String(index),
        customerName: customerNameFor(index),
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addFamilyMember() {
    setDialogOpen(true);
  }

  function handleAddMember(member: NewFamilyMember) {
    memberIdRef.current += 1;
    const id = memberIdRef.current;
    const newIndex = familyMembers.length + 1;
    const displayName =
      member.name.trim() || member.phone.trim() || `Family Member ${newIndex + 1}`;
    setFamilyMembers((prev) => [
      ...prev,
      { key: id, name: member.name, phone: member.phone },
    ]);
    setFamilyPrescriptions((prev) => [...prev, member.prescription]);
    setItems((prev) => [
      ...prev,
      ...member.items.map((it) => ({
        ...it,
        customerId: String(newIndex),
        customerName: displayName,
      })),
    ]);
  }

  function removeFamilyMember(key: number) {
    const idx = familyMembers.findIndex((m) => m.key === key);
    if (idx < 0) return;
    const removedIndex = idx + 1;
    setFamilyMembers((prev) => prev.filter((m) => m.key !== key));
    setFamilyPrescriptions((prev) =>
      prev.filter((_, i) => i !== idx)
    );
    setItems((prev) =>
      prev
        .filter((i) => parseInt(i.customerId || "0", 10) !== removedIndex)
        .map((i) => {
          const c = parseInt(i.customerId || "0", 10);
          if (c > removedIndex) {
            return {
              ...i,
              customerId: String(c - 1),
              customerName: customerNameFor(c - 1),
            };
          }
          return i;
        })
    );
  }

  async function handleCreate() {
    setError("");

    if (!customerPhone.trim()) {
      setError("Please enter a customer phone number.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item to the order.");
      return;
    }

    setLoading(true);
    const payload = {
      customerPhone: customerPhone.trim(),
      familyMembers: familyMembers.map((m) => ({
        name: m.name,
        phone: m.phone,
      })),
      items: items.map((i) => ({
        productId: i.productId || undefined,
        customerId: i.customerId || undefined,
        productName: i.productName,
        category: i.category,
        subType: i.subType || undefined,
        quantity: i.quantity,
        price: i.price,
      })),
      advance: Math.min(advanceNum, subtotal),
      paymentMethod,
      notes,
      prescription: hasPrescriptionItem
        ? {
            rightSphere: prescription.rightSphere,
            rightCylinder: prescription.rightCylinder,
            rightAxis: prescription.rightAxis,
            rightAdd: prescription.rightAdd,
            rightPD: prescription.rightPD,
            leftSphere: prescription.leftSphere,
            leftCylinder: prescription.leftCylinder,
            leftAxis: prescription.leftAxis,
            leftAdd: prescription.leftAdd,
            leftPD: prescription.leftPD,
            notes: prescription.notes,
          }
        : undefined,
      customerPrescriptions: [
        {
          customerId: "0",
          prescription:
            hasPrescriptionItem && !!prescription.rightSphere
              ? {
                  rightSphere: prescription.rightSphere,
                  rightCylinder: prescription.rightCylinder,
                  rightAxis: prescription.rightAxis,
                  rightAdd: prescription.rightAdd,
                  rightPD: prescription.rightPD,
                  leftSphere: prescription.leftSphere,
                  leftCylinder: prescription.leftCylinder,
                  leftAxis: prescription.leftAxis,
                  leftAdd: prescription.leftAdd,
                  leftPD: prescription.leftPD,
                  notes: prescription.notes,
                }
              : undefined,
        },
        ...familyMembers.map((m) => {
          const fp = familyPrescriptions[familyMembers.indexOf(m)];
          const hasRx =
            !!fp &&
            !!(
              fp.rightSphere ||
              fp.rightCylinder ||
              fp.rightAxis ||
              fp.rightAdd ||
              fp.rightPD ||
              fp.leftSphere ||
              fp.leftCylinder ||
              fp.leftAxis ||
              fp.leftAdd ||
              fp.leftPD ||
              fp.notes
            );
          return {
            customerId: String(familyMembers.indexOf(m) + 1),
            prescription: hasRx
              ? {
                  rightSphere: fp.rightSphere,
                  rightCylinder: fp.rightCylinder,
                  rightAxis: fp.rightAxis,
                  rightAdd: fp.rightAdd,
                  rightPD: fp.rightPD,
                  leftSphere: fp.leftSphere,
                  leftCylinder: fp.leftCylinder,
                  leftAxis: fp.leftAxis,
                  leftAdd: fp.leftAdd,
                  leftPD: fp.leftPD,
                  notes: fp.notes,
                }
              : undefined,
          };
        }),
      ],
    };

    const res = await createQuickOrderAction(payload);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Something went wrong");
      return;
    }
    window.location.href = `/orders/success?orderId=${res.orderId}`;
  }

  return (
    <>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Customer 1 Phone Number</Label>
              <Input
                id="phone"
                placeholder="03001234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If the number is new, a new customer will be created automatically.
              </p>
            </div>

            {familyMembers.map((m, i) => {
              const memberItems = items.filter(
                (it) => parseInt(it.customerId || "0", 10) === i + 1
              );
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">
                      {customerNameFor(i + 1)}
                    </div>
                    <div className="text-muted-foreground">
                      {memberItems.length} item{memberItems.length === 1 ? "" : "s"}{" "}
                      {m.phone ? `• ${m.phone}` : ""}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeFamilyMember(m.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={addFamilyMember}
              disabled={!customerPhone.trim()}
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Add Family Member
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <h3 className="font-semibold">
                {customerNameFor(0)}{" "}
                <span className="font-normal text-muted-foreground">
                  (Customer 1)
                </span>
              </h3>
              {categories.map((cat) => (
                <ProductSelector
                  key={`c1-${cat}`}
                  title={`Select ${CATEGORY_LABELS[cat] || cat}`}
                  category={cat}
                  categoryLabel={CATEGORY_LABELS[cat] || cat}
                  products={productsByCategory[cat] || []}
                  currency={currency}
                  onAdd={(item) => addItemFor(0, item)}
                  customPlaceholder={`${CATEGORY_LABELS[cat] || cat} Description`}
                  showQuantity
                  subTypes={CATEGORY_TYPES[cat]}
                  hideDescription
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {customerHasRxItem(0) && (
          <div className="space-y-1.5">
            <h3 className="font-semibold">
              {customerNameFor(0)} — Eye Prescription
            </h3>
            <PrescriptionForm values={prescription} onChange={setPrescription} />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <div className="overflow-x-auto">
              {items.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No items added yet.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="px-4 py-2 text-left font-medium">Item</th>
                      <th className="px-4 py-2 text-left font-medium">Customer</th>
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-left font-medium">Type</th>
                      <th className="px-4 py-2 text-right font-medium">Qty</th>
                      <th className="px-4 py-2 text-right font-medium">Price</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr
                        key={`${item.productName}-${idx}`}
                        className="border-b"
                      >
                        <td className="px-4 py-2 font-medium">
                          {item.productName}
                        </td>
                        <td className="px-4 py-2">
                          {item.customerName || "—"}
                        </td>
                        <td className="px-4 py-2 capitalize">
                          {(CATEGORY_LABELS[item.category] || item.category).toLowerCase()}
                        </td>
                        <td className="px-4 py-2 capitalize">
                          {item.subType ? item.subType.toLowerCase() : "-"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(item.price, currency)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(item.total, currency)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(idx)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="advance">Advance Payment</Label>
              <Input
                id="advance"
                type="number"
                min="0"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-base font-bold">
                <span>REMAINING BALANCE</span>
                <span>{formatCurrency(Math.max(0, balance), currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="order-notes">Notes</Label>
          <textarea
            id="order-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional..."
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          onClick={handleCreate}
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            "Order"
          )}
        </Button>
      </div>
      </div>

      <FamilyMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        productsByCategory={productsByCategory}
        currency={currency}
        onAddMember={handleAddMember}
      />
    </>
  );
}
