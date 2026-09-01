import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { OrdersClient } from "./OrdersClient";

export default async function OrdersPage() {
  await requireAuth();
  const settings = await getSettings();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  const serialized = orders.map((o) => ({
    ...o,
    orderDate: o.orderDate.toISOString(),
    collectionDate: o.collectionDate.toISOString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    customer: {
      ...o.customer,
      createdAt: o.customer.createdAt.toISOString(),
      updatedAt: o.customer.updatedAt.toISOString(),
    },
  }));

  return (
    <div>
      <PageHeader title="Orders" subtitle="All orders" />
      <OrdersClient orders={serialized as any} currency={settings.currency} />
    </div>
  );
}
