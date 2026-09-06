import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { TestingSlipForm } from "@/components/testing-slips/TestingSlipForm";

export default async function NewTestingSlipPage() {
  await requireAuth();
  const settings = await getSettings();

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      customerNumber: true,
      name: true,
      phone: true,
    },
  });

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="New Testing Slip"
        subtitle="Record eye prescription, price and advance payment"
      />
      <TestingSlipForm
        customers={customers.map((c) => ({
          id: c.id,
          customerNumber: c.customerNumber,
          name: c.name,
          phone: c.phone,
        }))}
        currency={settings.currency}
      />
    </div>
  );
}
