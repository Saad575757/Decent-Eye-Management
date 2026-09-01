"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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

interface CategoryOrderFormProps {
  category: string;
  categoryName: string;
  currency: string;
}

export function CategoryOrderForm({
  category,
  categoryName,
  currency,
}: CategoryOrderFormProps) {
  const [customerNumberInput, setCustomerNumberInput] = useState("");
  const [amount, setAmount] = useState("");
  const [advance, setAdvance] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const amountNum = Math.max(0, parseFloat(amount) || 0);
  const advanceNum = Math.max(0, parseFloat(advance) || 0);
  const balance = amountNum - Math.min(advanceNum, amountNum);
  const advanceError = advanceNum > amountNum;

  async function handleCreate() {
    setError("");

    if (!customerNumberInput.trim()) {
      setError("Please enter a customer phone number.");
      return;
    }
    if (amountNum <= 0) {
      setError("Please enter the order amount.");
      return;
    }

    setLoading(true);
    const payload = {
      customerPhone: customerNumberInput.trim(),
      category,
      amount: amountNum,
      advance: Math.min(advanceNum, amountNum),
      paymentMethod,
      notes,
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
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{categoryName} Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-number">Customer Phone Number</Label>
            <Input
              id="customer-number"
              placeholder="e.g. 03001234567"
              value={customerNumberInput}
              onChange={(e) => setCustomerNumberInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If the number is new, a new customer will be created automatically.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance">Customer Advance</Label>
            <Input
              id="advance"
              type="number"
              min="0"
              placeholder="0"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
            />
            {advanceError && (
              <p className="text-xs text-destructive">
                Advance cannot be greater than amount.
              </p>
            )}
          </div>

          <div className="space-y-2">
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

          <div className="rounded-lg border px-4 py-3">
            <div className="flex justify-between text-base font-bold">
              <span>Remaining Balance</span>
              <span>{formatCurrency(Math.max(0, balance), currency)}</span>
            </div>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
