import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
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
import { ChangeStatus } from "@/components/orders/ChangeStatus";
import OrderDetailClient from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const settings = await getSettings();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      prescription: true,
      items: true,
      payments: { orderBy: { date: "desc" } },
      invoice: true,
    },
  });

  if (!order) notFound();

  const currency = settings.currency;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title={order.orderNumber}
        subtitle={`Created ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/orders/${order.id}/print-bill`} target="_blank">
                <Printer className="h-4 w-4" />
                Print Bill
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/orders/${order.id}/print-slip`} target="_blank">
                <Printer className="h-4 w-4" />
                Print Slip
              </Link>
            </Button>
            <OrderDetailClient
              orderId={order.id}
              total={order.total}
              paid={order.paid}
              balance={order.balance}
              currency={currency}
              currentStatus={order.status}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Order Number</div>
                <div className="font-medium">{order.orderNumber}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Order Date</div>
                <div>{formatDate(order.orderDate)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Collection Date
                </div>
                <div className="font-medium">
                  {formatDate(order.collectionDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>
                <span className="font-medium">{order.customer.name}</span>{" "}
                <span className="text-muted-foreground">
                  ({order.customer.customerNumber})
                </span>
              </div>
              <div>{order.customer.phone}</div>
              {order.customer.address && (
                <div className="text-muted-foreground">
                  {order.customer.address}
                </div>
              )}
            </CardContent>
          </Card>

          {order.prescription && (
            <Card>
              <CardHeader>
                <CardTitle>Prescription</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="mb-2 font-medium">Right Eye</div>
                    <div className="space-y-0.5">
                      <div>SPH: {order.prescription.rightSphere || "—"}</div>
                      <div>CYL: {order.prescription.rightCylinder || "—"}</div>
                      <div>AXIS: {order.prescription.rightAxis || "—"}</div>
                      <div>ADD: {order.prescription.rightAdd || "—"}</div>
                      <div>PD: {order.prescription.rightPD || "—"}</div>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="mb-2 font-medium">Left Eye</div>
                    <div className="space-y-0.5">
                      <div>SPH: {order.prescription.leftSphere || "—"}</div>
                      <div>CYL: {order.prescription.leftCylinder || "—"}</div>
                      <div>AXIS: {order.prescription.leftAxis || "—"}</div>
                      <div>ADD: {order.prescription.leftAdd || "—"}</div>
                      <div>PD: {order.prescription.leftPD || "—"}</div>
                    </div>
                  </div>
                </div>
                {order.prescription.notes && (
                  <div className="mt-3 text-muted-foreground">
                    {order.prescription.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.category.toLowerCase()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {order.payments.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-muted-foreground">
                  No payments recorded.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDateTime(p.date)}</TableCell>
                        <TableCell>{p.paymentMethod}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(p.amount, currency)}
                        </TableCell>
                        <TableCell>{p.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{order.notes}</CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatCurrency(order.discount, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-green-600">
                  {formatCurrency(order.paid, currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Balance</span>
                <span className={order.balance > 0 ? "text-destructive" : ""}>
                  {formatCurrency(order.balance, currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangeStatus
                orderId={order.id}
                current={order.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
