import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { TestingSlipForm } from "@/components/testing-slips/TestingSlipForm";

export default async function EditTestingSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const [slip, settings] = await Promise.all([
    prisma.testingSlip.findUnique({
      where: { id },
      include: { customer: true },
    }),
    getSettings(),
  ]);
  if (!slip) notFound();

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
    <div>
      <PageHeader
        title={`Edit Testing Slip ${slip.slipNumber}`}
        subtitle={`Customer: ${slip.customer.name}`}
      />
      <div className="p-4 sm:p-6">
        <TestingSlipForm
          slipId={slip.id}
          customers={customers.map((c) => ({
            id: c.id,
            customerNumber: c.customerNumber,
            name: c.name,
            phone: c.phone,
          }))}
          currency={settings.currency}
          existing={{
            customerId: slip.customerId,
            prescription: {
              rightSphere: slip.rightSphere || "",
              rightCylinder: slip.rightCylinder || "",
              rightAxis: slip.rightAxis || "",
              rightAdd: slip.rightAdd || "",
              rightPD: slip.rightPD || "",
              leftSphere: slip.leftSphere || "",
              leftCylinder: slip.leftCylinder || "",
              leftAxis: slip.leftAxis || "",
              leftAdd: slip.leftAdd || "",
              leftPD: slip.leftPD || "",
              notes: "",
            },
            price: String(slip.price),
            advance: String(slip.advance),
            notes: slip.notes || "",
          }}
        />
      </div>
    </div>
  );
}