import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { PaymentsClient } from "./PaymentsClient";

export default async function PaymentsPage() {
  await requireAuth();
  const settings = await getSettings();

  const payments = await prisma.payment.findMany({
    orderBy: { date: "desc" },
    include: {
      order: {
        include: { customer: true },
      },
    },
  });

  const serialized = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    paymentMethod: p.paymentMethod,
    date: p.date.toISOString(),
    notes: p.notes,
    order: {
      id: p.order.id,
      orderNumber: p.order.orderNumber,
      customer: {
        id: p.order.customer.id,
        name: p.order.customer.name,
        phone: p.order.customer.phone,
      },
    },
  }));

  return (
    <div>
      <PageHeader title="Payments" subtitle="Payment history" />
      <PaymentsClient payments={serialized} currency={settings.currency} />
    </div>
  );
}
