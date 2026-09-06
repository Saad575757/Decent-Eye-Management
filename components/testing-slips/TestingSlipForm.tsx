"use client";

import { useState } from "react";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PrescriptionForm,
  getEmptyPrescription,
  type PrescriptionValues,
} from "@/components/orders/PrescriptionForm";
import { formatCurrency, cn } from "@/lib/utils";
import {
  createTestingSlipAction,
  updateTestingSlipAction,
  createQuickCustomerAction,
} from "@/lib/actions";

interface CustomerOption {
  id: string;
  customerNumber: string;
  name: string;
  phone: string;
}

export interface ExistingTestingSlip {
  customerId: string;
  prescription: PrescriptionValues;
  price: string;
  advance: string;
  notes: string;
}

interface TestingSlipFormProps {
  customers: CustomerOption[];
  currency: string;
  slipId?: string;
  existing?: ExistingTestingSlip;
}

export function TestingSlipForm({
  customers,
  currency,
  slipId,
  existing,
}: TestingSlipFormProps) {
  const isEdit = !!slipId && !!existing;
  const [customerId, setCustomerId] = useState(existing?.customerId || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    whatsapp: "",
  });

  const [prescription, setPrescription] = useState<PrescriptionValues>(
    existing?.prescription ?? getEmptyPrescription()
  );

  const [price, setPrice] = useState(existing?.price ?? "");
  const [advance, setAdvance] = useState(existing?.advance ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const priceNum = Math.max(0, parseFloat(price) || 0);
  const advanceNum = Math.max(0, parseFloat(advance) || 0);
  const remaining = Math.max(0, priceNum - advanceNum);

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.customerNumber.toLowerCase().includes(q)
    );
  });

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
    if (!customerId && !showNewCustomer) {
      setError("Please select a customer or add a new customer.");
      return;
    }
    if (!price) {
      setError("Please enter the price.");
      return;
    }
    setLoading(true);

    const payload = {
      customerId,
      price: priceNum,
      advance: Math.min(advanceNum, priceNum),
      notes,
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
    };

    const res = isEdit
      ? await updateTestingSlipAction(slipId!, payload)
      : await createTestingSlipAction(payload);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Something went wrong");
      return;
    }
    window.location.href = `/testing-slips/${res.slipId}`;
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
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
                        setNewCustomer({
                          ...newCustomer,
                          phone: e.target.value,
                        })
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

        <PrescriptionForm values={prescription} onChange={setPrescription} />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price ({currency})</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="advance">Advance Payment ({currency})</Label>
              <Input
                id="advance"
                type="number"
                min="0"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  {formatCurrency(priceNum, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Advance</span>
                <span className="font-medium">
                  {formatCurrency(advanceNum, currency)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Remaining</span>
                <span>{formatCurrency(remaining, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="slip-notes">Notes</Label>
          <Textarea
            id="slip-notes"
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
              {isEdit ? "Updating Testing Slip..." : "Creating Testing Slip..."}
            </>
          ) : isEdit ? (
            "Update Testing Slip"
          ) : (
            "Create Testing Slip"
          )}
        </Button>
      </div>
    </div>
  );
}
