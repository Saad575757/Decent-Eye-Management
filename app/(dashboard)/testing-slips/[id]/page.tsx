import { notFound } from "next/navigation";
import Link from "next/link";
import { Printer, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function TestingSlipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const settings = await getSettings();

  const slip = await prisma.testingSlip.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!slip) notFound();

  const rows: { label: string; value: string }[] = [
    { label: "SPH", value: slip.rightSphere || "—" },
    { label: "CYL", value: slip.rightCylinder || "—" },
    { label: "AXIS", value: slip.rightAxis || "—" },
    { label: "ADD", value: slip.rightAdd || "—" },
    { label: "PD", value: slip.rightPD || "—" },
  ];
  const leftRows: { label: string; value: string }[] = [
    { label: "SPH", value: slip.leftSphere || "—" },
    { label: "CYL", value: slip.leftCylinder || "—" },
    { label: "AXIS", value: slip.leftAxis || "—" },
    { label: "ADD", value: slip.leftAdd || "—" },
    { label: "PD", value: slip.leftPD || "—" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title={`Testing Slip ${slip.slipNumber}`}
        subtitle={formatDateTime(slip.createdAt)}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/testing-slips/${slip.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/testing-slips/${slip.id}/print`}>
                <Printer className="h-4 w-4" />
                Print Testing Slip
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Customer
              </h3>
              <Link
                href={`/customers/${slip.customer.id}`}
                className="mt-1 block text-lg font-bold hover:underline"
              >
                {slip.customer.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {slip.customer.phone}
              </p>
            </div>
            <div className="border-t pt-4">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                Right Eye
              </h3>
              <div className="overflow-x-auto">
                <Card>
                  <CardContent className="p-4">
                    {rows.map((r) => (
                      <div
                        key={r.label}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <span className="text-sm text-muted-foreground">
                          {r.label}
                        </span>
                        <span className="text-sm font-medium">{r.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                Left Eye
              </h3>
              <div className="overflow-x-auto">
                <Card>
                  <CardContent className="p-4">
                    {leftRows.map((r) => (
                      <div
                        key={r.label}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <span className="text-sm text-muted-foreground">
                          {r.label}
                        </span>
                        <span className="text-sm font-medium">{r.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
            {slip.notes && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Notes
                </h3>
                <p className="mt-1 text-sm">{slip.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Pricing & Payment
            </h3>
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  {formatCurrency(slip.price, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Advance Payment</span>
                <span className="font-medium">
                  {formatCurrency(slip.advance, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Remaining</span>
                <span>{formatCurrency(slip.remaining, settings.currency)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/customers/${slip.customer.id}`}>
                  View Customer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}