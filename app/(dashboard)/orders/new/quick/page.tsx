import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { QuickOrderForm } from "@/components/orders/QuickOrderForm";

const VALID_CATEGORIES = [
  "FRAME",
  "GLASS",
  "SUNGLASSES",
  "SOLUTION",
  "CONTACT_LENS",
  "LENS",
  "ACCESSORY",
] as const;

const DEFAULT_MEMBER_CATEGORIES = [
  "FRAME",
  "GLASS",
  "SUNGLASSES",
  "SOLUTION",
  "CONTACT_LENS",
];

export default async function QuickOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ categories?: string }>;
}) {
  await requireAuth();
  const { categories: catParam } = await searchParams;

  if (!catParam) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Quick Order" subtitle="No categories selected" />
        <p className="text-sm text-muted-foreground">
          Please go back and select at least one category.
        </p>
      </div>
    );
  }

  const categories = catParam
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c): c is (typeof VALID_CATEGORIES)[number] =>
      (VALID_CATEGORIES as readonly string[]).includes(c)
    );

  if (categories.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Quick Order" subtitle="No valid categories" />
        <p className="text-sm text-muted-foreground">
          No valid categories found. Please go back and try again.
        </p>
      </div>
    );
  }

  const settings = await getSettings();

  const products = await prisma.product.findMany({
    where: { category: { in: DEFAULT_MEMBER_CATEGORIES as never } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      brand: true,
      sellingPrice: true,
      stock: true,
      category: true,
    },
  });

  const productsByCategory: Record<string, { id: string; name: string; brand: string | null; sellingPrice: number; stock: number }[]> = {};
  for (const cat of DEFAULT_MEMBER_CATEGORIES) {
    productsByCategory[cat] = products
      .filter((p) => p.category === cat)
      .map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
      }));
  }

  return (
    <div>
      <PageHeader title="Quick Order" subtitle="Create a multi-category order" />
      <div className="p-4 sm:p-6">
        <QuickOrderForm
          categories={categories}
          productsByCategory={productsByCategory}
          currency={settings.currency}
        />
      </div>
    </div>
  );
}
