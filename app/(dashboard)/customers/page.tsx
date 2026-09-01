import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage() {
  await requireAuth();
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const serialized = customers.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage your customers" />
      <CustomersClient customers={serialized} />
    </div>
  );
}
