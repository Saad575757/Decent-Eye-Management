import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { CategoryOrderForm } from "@/components/orders/CategoryOrderForm";

const CATEGORIES = [
  "FRAME",
  "GLASS",
  "SUNGLASSES",
  "SOLUTION",
  "CONTACT_LENS",
  "LENS",
  "ACCESSORY",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  FRAME: "Frame",
  GLASS: "Glass",
  LENS: "Lens",
  SUNGLASSES: "Sunglasses",
  SOLUTION: "Solution",
  CONTACT_LENS: "Contact Lens",
  ACCESSORY: "Accessory",
};

export default async function CategoryOrderPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  await requireAuth();
  const { category } = await params;
  const categoryKey = category.toUpperCase();

  if (!CATEGORIES.includes(categoryKey as (typeof CATEGORIES)[number])) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Invalid Category" />
        <p className="text-sm text-muted-foreground">
          The selected category is not valid. Please go back and choose again.
        </p>
      </div>
    );
  }

  const settings = await getSettings();
  const categoryName = CATEGORY_LABELS[categoryKey];

  return (
    <div>
      <PageHeader
        title={`New ${categoryName} Order`}
        subtitle={`Create an order for ${categoryName.toLowerCase()}`}
      />
      <div className="p-4 sm:p-6">
        <CategoryOrderForm
          category={categoryKey}
          categoryName={categoryName}
          currency={settings.currency}
        />
      </div>
    </div>
  );
}
