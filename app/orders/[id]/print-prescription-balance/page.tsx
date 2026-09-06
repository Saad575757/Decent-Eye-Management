import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getOrderForPrint } from "@/lib/services/print";
import { formatCurrency } from "@/lib/utils";
import {
  EyePrescriptionPrint,
  type EyePrescriptionPrintData,
} from "@/components/print/EyePrescriptionPrint";
import { WhatsAppSend } from "@/components/print/WhatsAppSend";

export const metadata: Metadata = {
  title: "",
};

export default async function PrintPrescriptionBalancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const [order, settings] = await Promise.all([
    getOrderForPrint(id),
    getSettings(),
  ]);
  if (!order) notFound();

  const seen = new Set<string>();
  const uniqueRxs = order.prescriptions.filter((rx) => {
    const key = rx.customerId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const data: EyePrescriptionPrintData = {
    shopName: settings.shopName,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    orderDate: order.orderDate,
    prescriptions: uniqueRxs.map((rx) => ({
      customerName: rx.customer?.name || undefined,
      rightSphere: rx.rightSphere,
      rightCylinder: rx.rightCylinder,
      rightAxis: rx.rightAxis,
      rightAdd: rx.rightAdd,
      rightPD: rx.rightPD,
      leftSphere: rx.leftSphere,
      leftCylinder: rx.leftCylinder,
      leftAxis: rx.leftAxis,
      leftAdd: rx.leftAdd,
      leftPD: rx.leftPD,
      notes: rx.notes,
    })),
    currency: settings.currency,
    total: order.total,
    paid: order.paid,
    balance: order.balance,
  };

  const waMessage = [
    `${settings.shopName} — Eye Prescription`,
    `Customer: ${data.customerName}`,
    `Phone: ${data.customerPhone}`,
    ``,
    `TOTAL: ${formatCurrency(order.total, settings.currency)}`,
    `PAID: ${formatCurrency(order.paid, settings.currency)}`,
    `BALANCE: ${formatCurrency(order.balance, settings.currency)}`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:py-0">
      <WhatsAppSend
        message={waMessage}
        recipients={[data.customerPhone]}
        shopWhatsapp={settings.whatsapp}
        printLabel="Print Prescription (Balance)"
        downloadName={`prescription-balance-${order.orderNumber}.png`}
      >
        <EyePrescriptionPrint data={data} />
      </WhatsAppSend>
    </div>
  );
}