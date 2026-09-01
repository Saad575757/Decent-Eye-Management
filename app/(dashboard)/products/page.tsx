import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { ProductsClient } from "./ProductsClient";

export default async function ProductsPage() {
  await requireAuth();
  const settings = await getSettings();
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  const serialized = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader title="Products" subtitle="Frames, lenses, sunglasses and accessories" />
      <ProductsClient
        products={serialized}
        currency={settings.currency}
        lowStockThreshold={settings.lowStockThreshold}
      />
    </div>
  );
}
