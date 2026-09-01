"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

export function OrderItems({
  items,
  currency,
  onRemove,
}: {
  items: CartItem[];
  currency: string;
  onRemove: (index: number) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-6 text-center text-muted-foreground"
            >
              No items added yet.
            </TableCell>
          </TableRow>
        ) : (
          items.map((item, idx) => (
            <TableRow key={`${item.productName}-${idx}`}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell className="capitalize">
                {item.category.toLowerCase()}
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.price, currency)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.total, currency)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(idx)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
