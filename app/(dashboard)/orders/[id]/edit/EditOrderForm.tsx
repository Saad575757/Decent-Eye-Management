"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PrescriptionForm,
  getEmptyPrescription,
  type PrescriptionValues,
} from "@/components/orders/PrescriptionForm";
import {
  ProductSelector,
  SelectableProduct,
} from "@/components/orders/ProductSelector";
import { formatCurrency } from "@/lib/utils";
import { updateOrderAction } from "@/lib/actions";
import type { CartItem } from "@/lib/types";

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

const ALL_CATEGORIES = [
  "FRAME",
  "GLASS",
  "LENS",
  "SUNGLASSES",
  "SOLUTION",
  "CONTACT_LENS",
  "ACCESSORY",
];

const PRESCRIPTION_CATEGORIES = ["FRAME", "LENS", "SUNGLASSES", "CONTACT_LENS"];

interface CustomerOption {
  id: string;
  customerNumber: string;
  name: string;
  phone: string;
}

export interface ExistingOrderData {
  customerId: string;
  orderDate: Date;
  collectionDate: Date;
  items: {
    customerId?: string;
    productId?: string;
    productName: string;
    category: string;
    subType?: string;
    quantity: number;
    price: number;
  }[];
  prescription?: PrescriptionValues;
  discount: number;
  paid: number;
  paymentMethod: string;
  notes: string;
  status: string;
}

interface EditOrderFormProps {
  orderId: string;
  customers: CustomerOption[];
  products: (SelectableProduct & { category: string })[];
  currency: string;
  existing: ExistingOrderData;
}

export function EditOrderForm({
  orderId,
  customers,
  products,
  currency,
  existing,
}: EditOrderFormProps) {
  const router = useRouter();
  const customer = customers.find((c) => c.id === existing.customerId);

  const [collectionDate, setCollectionDate] = useState(() =>
    format(existing.collectionDate, "yyyy-MM-dd")
  );
  const [items, setItems] = useState<CartItem[]>(() =>
    existing.items.map((i) => ({
      customerId: i.customerId,
      productId: i.productId || undefined,
      productName: i.productName,
      category: i.category,
      subType: i.subType,
      quantity: i.quantity,
      price: i.price,
      total: i.price * i.quantity,
    }))
  );
  const [prescription, setPrescription] = useState<PrescriptionValues>(
    existing.prescription || getEmptyPrescription()
  );
  const [discount, setDiscount] = useState(String(existing.discount));
  const [paid, setPaid] = useState(String(existing.paid));
  const [paymentMethod, setPaymentMethod] = useState(existing.paymentMethod);
  const [notes, setNotes] = useState(existing.notes);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const productsByCategory = useMemo(() => {
    const map: Record<string, SelectableProduct[]> = {};
    for (const p of products) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }, [products]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.total, 0),
    [items]
  );
  const discountNum = Math.max(0, parseFloat(discount) || 0);
  const total = subtotal - Math.min(discountNum, subtotal);
  const paidNum = Math.max(0, parseFloat(paid) || 0);
  const balance = total - Math.min(paidNum, total);

  const hasPrescriptionItem = items.some((i) =>
    PRESCRIPTION_CATEGORIES.includes(i.category)
  );
  const rxHasValues = Object.values(prescription).some((v) => v.trim() !== "");

  function addItem(item: CartItem) {
    setItems((prev) => [...prev, item]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    setLoading(true);

    if (items.length === 0) {
      setError("Add at least one item to the order.");
      setLoading(false);
      return;
    }

    const payload = {
      customerId: existing.customerId,
      orderDate: format(existing.orderDate, "yyyy-MM-dd"),
      collectionDate,
      discount: discountNum,
      paid: Math.min(paidNum, total),
      paymentMethod,
      notes,
      items: items.map((i) => ({
        productId: i.productId || undefined,
        customerId: i.customerId || undefined,
        productName: i.productName,
        category: i.category,
        subType: i.subType || undefined,
        quantity: i.quantity,
        price: i.price,
      })),
      prescription:
        rxHasValues || prescription.notes.trim()
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
    };

    const res = await updateOrderAction(orderId, payload);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Something went wrong");
      return;
    }
    router.push(`/orders/${orderId}`);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Order Date</Label>
                <Input
                  type="date"
                  value={format(existing.orderDate, "yyyy-MM-dd")}
                  readOnly
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Expected Collection Date</Label>
                <Input
                  type="date"
                  value={collectionDate}
                  min={format(existing.orderDate, "yyyy-MM-dd")}
                  onChange={(e) => setCollectionDate(e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg border border-muted p-3 text-sm">
              <div className="font-medium">
                {customer?.name || existing.customerId}
              </div>
              <div className="text-xs text-muted-foreground">
                {customer ? `${customer.customerNumber} • ${customer.phone}` : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              {ALL_CATEGORIES.map((cat) => (
                <ProductSelector
                  key={`edit-${cat}`}
                  title={`Select ${CATEGORY_LABELS[cat] || cat}`}
                  category={cat}
                  categoryLabel={CATEGORY_LABELS[cat] || cat}
                  products={productsByCategory[cat] || []}
                  currency={currency}
                  onAdd={addItem}
                  customPlaceholder={`${CATEGORY_LABELS[cat] || cat} Description`}
                  showQuantity
                  subTypes={CATEGORY_TYPES[cat]}
                  hideDescription
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {(hasPrescriptionItem || rxHasValues) && (
          <Card>
            <CardHeader>
              <CardTitle>Eye Prescription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <PrescriptionForm
                values={prescription}
                onChange={setPrescription}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <div className="overflow-x-auto">
              {items.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No items yet.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="px-4 py-2 text-left font-medium">Item</th>
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
                        <td className="px-4 py-2 capitalize">
                          {(
                            CATEGORY_LABELS[item.category] || item.category
                          ).toLowerCase()}
                        </td>
                        <td className="px-4 py-2 capitalize">
                          {item.subType ? item.subType.toLowerCase() : "-"}
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
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
              <Label htmlFor="discount">Discount ({currency})</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              {discountNum > subtotal && (
                <p className="text-xs text-destructive">
                  Discount cannot be greater than subtotal.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paid">Paid Amount</Label>
              <Input
                id="paid"
                type="number"
                min="0"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
              />
              {paidNum > total && (
                <p className="text-xs text-destructive">
                  Paid cannot be greater than total.
                </p>
              )}
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
          <Textarea
            id="order-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional..."
          />
        </div>

        {error && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/orders/${orderId}`)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}