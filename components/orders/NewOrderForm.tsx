"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Loader2, Plus, Search, Check } from "lucide-react";
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
import { OrderItems } from "@/components/orders/OrderItems";
import { formatCurrency, cn } from "@/lib/utils";
import { createOrderAction, createQuickCustomerAction } from "@/lib/actions";
import type { CartItem } from "@/lib/types";

const FRAME_TYPES = [
  "Sheet Frame",
  "Sheet Branded Frame",
  "Metal Frame",
  "Metal Branded Frame",
  "Other",
];

const SUNGLASS_TYPES = [
  "Fancy",
  "Brand",
  "Other",
];

const CONTACT_LENS_TYPES = [
  "Other",
];

interface CustomerOption {
  id: string;
  customerNumber: string;
  name: string;
  phone: string;
}

interface NewOrderFormProps {
  customers: CustomerOption[];
  products: (SelectableProduct & { category: string })[];
  currency: string;
  defaultCollectionDays: number;
  initialCustomerId?: string | null;
}

export function NewOrderForm({
  customers,
  products,
  currency,
  defaultCollectionDays,
  initialCustomerId,
}: NewOrderFormProps) {
  const [customerId, setCustomerId] = useState(initialCustomerId || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    address: "",
  });

  const orderDate = new Date();
  const [collectionDate, setCollectionDate] = useState(() =>
    format(addDays(orderDate, defaultCollectionDays), "yyyy-MM-dd")
  );

  const [prescription, setPrescription] = useState<PrescriptionValues>(
    getEmptyPrescription()
  );

  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState("0");
  const [paid, setPaid] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const frameProducts = products.filter((p) => p.category === "FRAME");
  const lensProducts = products.filter((p) => p.category === "LENS");
  const sunglassProducts = products.filter((p) => p.category === "SUNGLASSES");
  const accessoryProducts = products.filter((p) => p.category === "ACCESSORY");
  const contactLensProducts = products.filter((p) => p.category === "CONTACT_LENS");

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.total, 0),
    [items]
  );
  const discountNum = Math.max(0, parseFloat(discount) || 0);
  const total = subtotal - Math.min(discountNum, subtotal);
  const paidNum = Math.max(0, parseFloat(paid) || 0);
  const balance = total - Math.min(paidNum, total);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.customerNumber.toLowerCase().includes(q)
    );
  });

  const PRESCRIPTION_CATEGORIES = ["FRAME", "LENS", "SUNGLASSES", "CONTACT_LENS"];
  const hasPrescriptionItem = items.some((i) => PRESCRIPTION_CATEGORIES.includes(i.category));

  function addItem(item: CartItem) {
    setItems((prev) => [...prev, item]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveNewCustomer() {
    setError("");
    setSavingCustomer(true);
    const res = await createQuickCustomerAction(newCustomer);
    setSavingCustomer(false);
    if (!res.ok || !res.id) {
      setError(res.error || "Something went wrong");
      return;
    }
    setCustomerId(res.id);
    setShowNewCustomer(false);
    setCustomerSearch("");
  }

  async function handleCreate() {
    setError("");
    setLoading(true);

    if (!customerId && !showNewCustomer) {
      setError("Please select a customer or add a new customer.");
      setLoading(false);
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item to the order.");
      setLoading(false);
      return;
    }

    const payload = {
      customerId: customerId || "",
      orderDate: format(orderDate, "yyyy-MM-dd"),
      collectionDate,
      discount: discountNum,
      paid: Math.min(paidNum, total),
      paymentMethod,
      notes,
      items: items.map((i) => ({
        productId: i.productId || undefined,
        productName: i.productName,
        category: i.category,
        quantity: i.quantity,
        price: i.price,
      })),
      prescription: hasPrescriptionItem ? {
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
      } : undefined,
      customer: showNewCustomer && !customerId ? newCustomer : undefined,
    };

    const res = await createOrderAction(payload);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Something went wrong");
      return;
    }
    window.location.href = `/orders/success?orderId=${res.orderId}`;
  }

  const discountError = discountNum > subtotal;
  const paidError = paidNum > total;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Order Date</Label>
                <Input
                  type="date"
                  value={format(orderDate, "yyyy-MM-dd")}
                  readOnly
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Expected Collection Date</Label>
                <Input
                  type="date"
                  value={collectionDate}
                  min={format(orderDate, "yyyy-MM-dd")}
                  onChange={(e) => setCollectionDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewCustomer ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customer by name, phone or number..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <p className="py-2 text-sm text-muted-foreground">
                      No customers found.
                    </p>
                  ) : (
                    filteredCustomers.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCustomerId(c.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors",
                          customerId === c.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent"
                        )}
                      >
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {c.customerNumber} • {c.phone}
                          </div>
                        </div>
                        {customerId === c.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCustomer(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Customer
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phone: e.target.value })
                      }
                      placeholder="03001234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                      value={newCustomer.whatsapp}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          whatsapp: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={saveNewCustomer}
                    disabled={savingCustomer}
                  >
                    {savingCustomer ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Save Customer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewCustomer(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {hasPrescriptionItem && (
          <PrescriptionForm values={prescription} onChange={setPrescription} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Frame</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSelector
              title="Select Frame"
              category="FRAME"
              products={frameProducts}
              currency={currency}
              onAdd={addItem}
              customPlaceholder="Frame Description"
              subTypes={FRAME_TYPES}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lens</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSelector
              title="Select Lens"
              category="LENS"
              products={lensProducts}
              currency={currency}
              onAdd={addItem}
              customPlaceholder="Lens Description"
              showQuantity
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sunglasses</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSelector
              title="Select Sunglasses"
              category="SUNGLASSES"
              products={sunglassProducts}
              currency={currency}
              onAdd={addItem}
              customPlaceholder="Sunglasses Description"
              showQuantity
              subTypes={SUNGLASS_TYPES}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Lens</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSelector
              title="Select Contact Lens"
              category="CONTACT_LENS"
              products={contactLensProducts}
              currency={currency}
              onAdd={addItem}
              customPlaceholder="Contact Lens Description"
              showQuantity
              subTypes={CONTACT_LENS_TYPES}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessories</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSelector
              title="Select Accessory"
              category="ACCESSORY"
              products={accessoryProducts}
              currency={currency}
              onAdd={addItem}
              customPlaceholder="Accessory Description"
              showQuantity
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <div className="p-4">
              <OrderItems items={items} currency={currency} onRemove={removeItem} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
                {discountError && (
                  <p className="text-xs text-destructive">
                    Discount cannot be greater than subtotal.
                  </p>
                )}
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-base font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(Math.max(0, total), currency)}</span>
              </div>
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
              {paidError && (
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
                <span>BALANCE</span>
                <span>{formatCurrency(Math.max(0, balance), currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="order-notes">Order Notes</Label>
          <Textarea
            id="order-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
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
            "Create Order"
          )}
        </Button>
      </div>
    </div>
  );
}
