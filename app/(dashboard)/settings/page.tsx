import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  await requireAuth();
  const settings = await getSettings();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Business and system settings" />
      <SettingsForm
        settings={{
          shopName: settings.shopName,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          address: settings.address,
          email: settings.email,
          currency: settings.currency,
          defaultCollectionDays: settings.defaultCollectionDays,
          lowStockThreshold: settings.lowStockThreshold,
        }}
      />
    </div>
  );
}
