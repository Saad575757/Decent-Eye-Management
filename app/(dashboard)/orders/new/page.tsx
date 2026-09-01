import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { NewOrderForm } from "@/components/orders/NewOrderForm";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  await requireAuth();
  const settings = await getSettings();
  const { customer } = await searchParams;

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        customerNumber: true,
        name: true,
        phone: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        brand: true,
        sellingPrice: true,
        stock: true,
        category: true,
      },
    }),
  ]);

  const initialCustomerId = customer || null;

  return (
    <div>
      <PageHeader title="New Order" subtitle="Create a new order" />
      <div className="p-4 sm:p-6">
        <NewOrderForm
          customers={customers}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            sellingPrice: p.sellingPrice,
            stock: p.stock,
            category: p.category,
          }))}
          currency={settings.currency}
          defaultCollectionDays={settings.defaultCollectionDays}
          initialCustomerId={initialCustomerId}
        />
      </div>
    </div>
  );
}
