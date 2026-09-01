"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/SearchInput";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type PaymentRow = {
  id: string;
  amount: number;
  paymentMethod: string;
  date: string;
  notes: string | null;
  order: {
    id: string;
    orderNumber: string;
    customer: { id: string; name: string; phone: string };
  };
};

export function PaymentsClient({
  payments,
  currency,
}: {
  payments: PaymentRow[];
  currency: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        p.order.customer.name.toLowerCase().includes(q) ||
        p.order.customer.phone.includes(q) ||
        p.order.orderNumber.toLowerCase().includes(q)
    );
  }, [payments, search]);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <SearchInput
        placeholder="Search by customer, phone or order number..."
        value={search}
        onChange={setSearch}
      />
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDateTime(p.date)}</TableCell>
                      <TableCell className="font-medium">
                        {p.order.customer.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.order.orderNumber}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(p.amount, currency)}
                      </TableCell>
                      <TableCell>{p.paymentMethod}</TableCell>
                      <TableCell>{p.notes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
