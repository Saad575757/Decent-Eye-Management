import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";
import {
  Plus,
  UserPlus,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { autoCancelUncollectedOrders } from "@/lib/services/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EmptyState } from "@/components/EmptyState";
import { QuickCategoryPicker } from "@/components/orders/QuickCategoryPicker";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  await requireAuth();
  await autoCancelUncollectedOrders();
  const settings = await getSettings();
  const currency = settings.currency;

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [recentOrders, todayCollections] = await Promise.all([
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.order.findMany({
      where: { collectionDate: { gte: todayStart, lte: todayEnd } },
      orderBy: { collectionDate: "asc" },
      include: { customer: true },
    }),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
            {greeting()}
          </h1>
          <p className="text-muted-foreground">{settings.shopName}</p>
        </div>
      </div>

      <Link
        href="/testing-slips/new"
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-800 p-5 text-white shadow-lg transition-transform hover:scale-[1.01]"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-110">
          <Plus className="h-6 w-6" />
        </div>
        <span className="text-lg font-bold">New Testing Slip</span>
      </Link>

<QuickCategoryPicker />

      {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button asChild size="lg" className="h-14 text-base">
          <Link href="/orders/new">
            <Plus className="h-5 w-5" />
            New Order
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-14 text-base">
          <Link href="/customers/new">
            <UserPlus className="h-5 w-5" />
            New Customer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No orders found"
                description="Create your first order to see it here."
                actionLabel="+ New Order"
                actionHref="/orders/new"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">
                        {o.orderNumber}
                      </TableCell>
                      <TableCell>{o.customer.name}</TableCell>
                      <TableCell>{o.customer.phone}</TableCell>
                      <TableCell>{formatDate(o.orderDate)}</TableCell>
                      <TableCell>{formatDate(o.collectionDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.total, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.paid, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.balance, currency)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/orders/${o.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Collections</CardTitle>
        </CardHeader>
        <CardContent>
          {todayCollections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No collections scheduled for today.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {todayCollections.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="font-mono text-sm font-semibold">
                    {o.orderNumber}
                  </div>
                  <div className="mt-1 font-medium">{o.customer.name}</div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {formatCurrency(o.total, currency)}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}
