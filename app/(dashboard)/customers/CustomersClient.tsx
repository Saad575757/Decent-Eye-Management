"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { deleteCustomerAction } from "@/lib/actions";

type CustomerRow = {
  id: string;
  customerNumber: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  notes: string | null;
  _count: { orders: number };
};

export function CustomersClient({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteCustomerAction(deleteTarget.id);
    if (res.ok) {
      setDeleteTarget(null);
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.customerNumber.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search by name, phone or customer number..."
          value={search}
          onChange={setSearch}
        />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No customers found"
                description="Add your first customer to create orders."
                actionLabel="+ Add Customer"
                onAction={() => setDialogOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">
                        {c.customerNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/customers/${c.id}`}
                          className="hover:underline"
                        >
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.whatsapp || "—"}</TableCell>
                      <TableCell>{c._count.orders}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/customers/${c.id}`}>View</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteTarget(c)}
                            aria-label={`Delete customer ${c.name}`}
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

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Customer"
        description={`Are you sure you want to delete customer ${
          deleteTarget?.name ?? ""
        }? All their orders, payments and prescriptions will also be deleted. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
