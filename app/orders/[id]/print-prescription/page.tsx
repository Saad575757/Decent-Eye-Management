import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getOrderForPrint } from "@/lib/services/print";
import {
  EyePrescriptionPrint,
  type EyePrescriptionPrintData,
} from "@/components/print/EyePrescriptionPrint";
import { WhatsAppSend } from "@/components/print/WhatsAppSend";

export const metadata: Metadata = {
  title: "",
};

export default async function PrintPrescriptionPage({
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
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <WhatsAppSend
        message={`${settings.shopName} — Eye Prescription\nCustomer: ${data.customerName}\nPhone: ${data.customerPhone}`}
        recipients={[data.customerPhone]}
        shopWhatsapp={settings.whatsapp}
        printLabel="Print Prescription"
        downloadName={`prescription-${order.orderNumber}.png`}
      >
        <EyePrescriptionPrint data={data} />
      </WhatsAppSend>
    </div>
  );
}