import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import {
  TestingSlipPrint,
  type TestingSlipPrintData,
} from "@/components/print/TestingSlipPrint";
import { WhatsAppSend } from "@/components/print/WhatsAppSend";

export const metadata: Metadata = {
  title: "",
};

export default async function PrintTestingSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const [slip, settings] = await Promise.all([
    prisma.testingSlip.findUnique({
      where: { id },
      include: { customer: true },
    }),
    getSettings(),
  ]);
  if (!slip) notFound();

  const data: TestingSlipPrintData = {
    shopName: settings.shopName,
    address: settings.address,
    phone: settings.phone,
    currency: settings.currency,
    slipNumber: slip.slipNumber,
    orderDate: slip.orderDate,
    customerName: slip.customer.name,
    customerPhone: slip.customer.phone,
    rightSphere: slip.rightSphere,
    rightCylinder: slip.rightCylinder,
    rightAxis: slip.rightAxis,
    rightAdd: slip.rightAdd,
    rightPD: slip.rightPD,
    leftSphere: slip.leftSphere,
    leftCylinder: slip.leftCylinder,
    leftAxis: slip.leftAxis,
    leftAdd: slip.leftAdd,
    leftPD: slip.leftPD,
    notes: slip.notes,
    price: slip.price,
    advance: slip.advance,
    remaining: slip.remaining,
  };

  const waMessage = [
    `${settings.shopName} â€” Testing Slip`,
    `Slip No: ${data.slipNumber}`,
    `Customer: ${data.customerName}`,
    `Phone: ${data.customerPhone}`,
    ``,
    `Eye Prescription:`,
    `  Right: SPH ${data.rightSphere || "-"} CYL ${data.rightCylinder || "-"} AXIS ${data.rightAxis || "-"} ADD ${data.rightAdd || "-"} PD ${data.rightPD || "-"}`,
    `  Left:  SPH ${data.leftSphere || "-"} CYL ${data.leftCylinder || "-"} AXIS ${data.leftAxis || "-"} ADD ${data.leftAdd || "-"} PD ${data.leftPD || "-"}`,
    ``,
    `Price: ${settings.currency} ${data.price}`,
    `Advance Payment: ${settings.currency} ${data.advance}`,
    `Remaining: ${settings.currency} ${data.remaining}`,
    ``,
    `Note: Please bring this signing slip when collecting your glasses.`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:py-0">
      <WhatsAppSend
        message={waMessage}
        recipients={[data.customerPhone]}
        shopWhatsapp={settings.whatsapp}
        printLabel="Print Testing Slip"
        downloadName={`testing-slip-${data.slipNumber}.png`}
      >
        <TestingSlipPrint slip={data} />
      </WhatsAppSend>
    </div>
  );
}