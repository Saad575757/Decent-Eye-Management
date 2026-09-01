"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

type OrderRow = {
  id: string;
  orderNumber: string;
  orderDate: string;
  total: number;
  paid: number;
  balance: number;
  status: string;
  customer: { name: string; phone: string };
};

export function ReportsClient({
  orders,
  currency,
}: {
  orders: OrderRow[];
  currency: string;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showAll, setShowAll] = useState(true);

  const filtered = useMemo(() => {
    if (!from && !to) return orders;
    return orders.filter((o) => {
      const d = new Date(o.orderDate);
      if (from && d < new Date(from)) return false;
      if (to) {
        const toEnd = new Date(to);
        toEnd.setHours(23, 59, 59, 999);
        if (d > toEnd) return false;
      }
      return true;
    });
  }, [orders, from, to]);

  const salesTotal = filtered.reduce((s, o) => s + o.total, 0);
  const paidTotal = filtered.reduce((s, o) => s + o.paid, 0);
  const balanceTotal = filtered.reduce((s, o) => s + o.balance, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setShowAll(false);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setShowAll(false);
                }}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFrom("");
                setTo("");
                setShowAll(true);
              }}
            >
              Reset
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Sales Total</div>
              <div className="text-lg font-bold">
                {formatCurrency(salesTotal, currency)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Paid</div>
              <div className="text-lg font-bold">
                {formatCurrency(paidTotal, currency)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Outstanding</div>
              <div className="text-lg font-bold">
                {formatCurrency(balanceTotal, currency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {!showAll && filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No orders in this date range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(showAll ? orders : filtered).map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">
                        {o.orderNumber}
                      </TableCell>
                      <TableCell>{o.customer.name}</TableCell>
                      <TableCell>{formatDate(o.orderDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.total, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.paid, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.balance, currency)}
                      </TableCell>
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
