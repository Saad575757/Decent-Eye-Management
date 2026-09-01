import Link from "next/link";
import { CheckCircle2, Printer, Eye, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  await requireAuth();
  const settings = await getSettings();
  const { orderId } = await searchParams;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
      })
    : null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Order Created Successfully
            </h1>
          </div>

          {order ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-semibold">{order.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collection Date</span>
                <span className="font-semibold">
                  {formatDate(order.collectionDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">
                  {formatCurrency(order.total, settings.currency)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Order created successfully.
            </p>
          )}

          <div className="grid grid-cols-1 gap-2">
            {order && (
              <>
                <Button asChild>
                  <Link href={`/orders/${order.id}/print-bill`} target="_blank">
                    <Printer className="h-4 w-4" />
                    Print Bill
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link
                    href={`/orders/${order.id}/print-slip`}
                    target="_blank"
                  >
                    <Printer className="h-4 w-4" />
                    Print Customer Slip
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={`/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                    View Order
                  </Link>
                </Button>
              </>
            )}
            <Button asChild variant="secondary">
              <Link href="/orders/new">
                <Plus className="h-4 w-4" />
                New Order
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
