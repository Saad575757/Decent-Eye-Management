import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getOrderForPrint } from "@/lib/services/print";
import { formatCurrency } from "@/lib/utils";
import { CustomerSlipPrint, type SlipData } from "@/components/print/CustomerSlipPrint";
import { WhatsAppSend } from "@/components/print/WhatsAppSend";

export default async function PrintSlipPage({
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

  const qrText = `${order.orderNumber}|${order.customer.name}|${order.total}`;
  const qrCode = await QRCode.toDataURL(qrText, { width: 200 });

  const slip: SlipData = {
    shopName: settings.shopName,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    currency: settings.currency,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    orderDate: order.orderDate,
    collectionDate: order.collectionDate,
    items: order.items.map((i) => ({
      customerName: i.customer?.name || undefined,
      label: i.subType ? `${i.productName} (${i.subType})` : i.productName,
    })),
    total: order.total,
    paid: order.paid,
    balance: order.balance,
    qrCode,
  };

  const waMessage = [
    `${settings.shopName} — Customer Slip`,
    `Order No: ${slip.orderNumber}`,
    `Customer: ${slip.customerName}`,
    `Phone: ${slip.customerPhone}`,
    `Order Date: ${format(new Date(slip.orderDate), "dd MMM yyyy")}`,
    ``,
    `Items:`,
    ...slip.items.map((i) => (i.customerName ? `${i.customerName}: ${i.label}` : i.label)),
    ``,
    `TOTAL: ${formatCurrency(slip.total, settings.currency)}`,
    `PAID: ${formatCurrency(slip.paid, settings.currency)}`,
    `BALANCE: ${formatCurrency(slip.balance, settings.currency)}`,
    `Collection Date: ${format(new Date(slip.collectionDate), "dd MMM yyyy")}`,
    ``,
    `Note: Article not collected within 30 days shall be considered unclaimed. Please bring this slip when collecting your glasses.`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <WhatsAppSend
        message={waMessage}
        recipients={[slip.customerPhone]}
        printLabel="Print Customer Slip"
        downloadName={`slip-${slip.orderNumber}.png`}
      >
        <CustomerSlipPrint slip={slip} />
      </WhatsAppSend>
    </div>
  );
}
