import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TestingSlipsClient } from "./TestingSlipsClient";

export default async function TestingSlipsPage() {
  await requireAuth();
  const settings = await getSettings();

  const slips = await prisma.testingSlip.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  const serialized = slips.map((s) => ({
    id: s.id,
    slipNumber: s.slipNumber,
    orderDate: s.orderDate.toISOString(),
    customer: {
      id: s.customer.id,
      name: s.customer.name,
      phone: s.customer.phone,
    },
    rightSphere: s.rightSphere,
    rightCylinder: s.rightCylinder,
    rightAxis: s.rightAxis,
    rightAdd: s.rightAdd,
    rightPD: s.rightPD,
    leftSphere: s.leftSphere,
    leftCylinder: s.leftCylinder,
    leftAxis: s.leftAxis,
    leftAdd: s.leftAdd,
    leftPD: s.leftPD,
    notes: s.notes,
    price: s.price,
    advance: s.advance,
    remaining: s.remaining,
  }));

  return (
    <div>
      <PageHeader
        title="Testing Slips"
        subtitle="Eye prescription, price and payment records"
        actions={
          <Button asChild>
            <Link href="/testing-slips/new">
              <Plus className="h-4 w-4" />
              New Testing Slip
            </Link>
          </Button>
        }
      />
      <TestingSlipsClient slips={serialized} currency={settings.currency} />
    </div>
  );
}