"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { deleteTestingSlipAction } from "@/lib/actions";

type TestingSlipRow = {
  id: string;
  slipNumber: string;
  orderDate: string;
  customer: { id: string; name: string; phone: string };
  price: number;
  advance: number;
  remaining: number;
};

export function TestingSlipsClient({
  slips,
  currency,
}: {
  slips: TestingSlipRow[];
  currency: string;
}) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TestingSlipRow | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteTestingSlipAction(deleteTarget.id);
    if (res.ok) {
      setDeleteTarget(null);
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return slips;
    const q = search.toLowerCase();
    return slips.filter(
      (s) =>
        s.customer.name.toLowerCase().includes(q) ||
        s.customer.phone.includes(q) ||
        s.slipNumber.toLowerCase().includes(q)
    );
  }, [slips, search]);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <SearchInput
        placeholder="Search by slip number, customer or phone..."
        value={search}
        onChange={setSearch}
      />
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No testing slips found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slip #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Advance</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {s.slipNumber}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/customers/${s.customer.id}`}
                          className="font-medium hover:underline"
                        >
                          {s.customer.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {s.customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(s.orderDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(s.price, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(s.advance, currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(s.remaining, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/testing-slips/${s.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/testing-slips/${s.id}/edit`}>
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteTarget(s)}
                            aria-label={`Delete testing slip ${s.slipNumber}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Testing Slip"
        description={`Are you sure you want to delete testing slip ${
          deleteTarget?.slipNumber ?? ""
        }? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}