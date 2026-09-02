import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const settings = await getSettings();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { prescriptions: { include: { customer: true } } },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title={customer.name}
        subtitle={`${customer.customerNumber} • ${customer.phone}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/customers/${customer.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit Customer
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/orders/new?customer=${customer.id}`}>
                <Plus className="h-4 w-4" />
                New Order
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="font-medium">{customer.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div>{customer.phone}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">WhatsApp</div>
              <div>{customer.whatsapp || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Address</div>
              <div>{customer.address || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Notes</div>
              <div>{customer.notes || "—"}</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Collection</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customer.orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">
                            {o.orderNumber}
                          </TableCell>
                          <TableCell>{formatDate(o.orderDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(o.total, settings.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(o.paid, settings.currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(o.balance, settings.currency)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={o.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDate(o.collectionDate)}
                          </TableCell>
                          <TableCell>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/orders/${o.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescription History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.orders.every((o) => o.prescriptions.length === 0) ? (
                <p className="text-sm text-muted-foreground">
                  No prescriptions recorded.
                </p>
              ) : (
                customer.orders
                  .filter((o) => o.prescriptions.length > 0)
                  .map((o) =>
                    o.prescriptions.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-lg border p-4 text-sm"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">
                            {o.orderNumber}
                            {p.customer &&
                              p.customer.name &&
                              ` — ${p.customer.name}`}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(o.orderDate)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-muted/50 p-2">
                            <div className="mb-1 font-medium">Right Eye</div>
                            <div>
                              SPH: <span>{p.rightSphere || "—"}</span>
                            </div>
                            <div>
                              CYL: <span>{p.rightCylinder || "—"}</span>
                            </div>
                            <div>
                              AXIS: <span>{p.rightAxis || "—"}</span>
                            </div>
                            <div>
                              ADD: <span>{p.rightAdd || "—"}</span>
                            </div>
                            <div>
                              PD: <span>{p.rightPD || "—"}</span>
                            </div>
                          </div>
                          <div className="rounded-md bg-muted/50 p-2">
                            <div className="mb-1 font-medium">Left Eye</div>
                            <div>
                              SPH: <span>{p.leftSphere || "—"}</span>
                            </div>
                            <div>
                              CYL: <span>{p.leftCylinder || "—"}</span>
                            </div>
                            <div>
                              AXIS: <span>{p.leftAxis || "—"}</span>
                            </div>
                            <div>
                              ADD: <span>{p.leftAdd || "—"}</span>
                            </div>
                            <div>
                              PD: <span>{p.leftPD || "—"}</span>
                            </div>
                          </div>
                        </div>
                        {p.notes && (
                          <div className="mt-2 text-muted-foreground">
                            {p.notes}
                          </div>
                        )}
                      </div>
                    ))
                  )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
