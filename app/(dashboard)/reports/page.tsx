import { startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage() {
  await requireAuth();
  const settings = await getSettings();
  const currency = settings.currency;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = startOfMonth(new Date());

  const [
    todaySales,
    monthSales,
    totalOrders,
    outstanding,
    pending,
    ready,
    delivered,
    allOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { orderDate: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { orderDate: { gte: monthStart } },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { balance: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "READY" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.findMany({
      orderBy: { orderDate: "desc" },
      include: { customer: true },
    }),
  ]);

  const summaryCards = [
    { title: "Today's Sales", value: formatCurrency(todaySales._sum.total || 0, currency) },
    { title: "This Month's Sales", value: formatCurrency(monthSales._sum.total || 0, currency) },
    { title: "Total Orders", value: String(totalOrders) },
    { title: "Outstanding Balance", value: formatCurrency(outstanding._sum.balance || 0, currency) },
    { title: "Pending Orders", value: String(pending) },
    { title: "Ready Orders", value: String(ready) },
    { title: "Delivered Orders", value: String(delivered) },
  ];

  const serializedOrders = allOrders.map((o) => ({
    ...o,
    orderDate: o.orderDate.toISOString(),
    collectionDate: o.collectionDate.toISOString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    customer: {
      id: o.customer.id,
      name: o.customer.name,
      phone: o.customer.phone,
    },
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader title="Reports" subtitle="Sales and order overview" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {summaryCards.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{c.title}</p>
              <p className="mt-1 text-xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <ReportsClient orders={serializedOrders as any} currency={currency} />
    </div>
  );
}
