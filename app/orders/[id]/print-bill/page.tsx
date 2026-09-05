import QRCode from "qrcode";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getOrderForPrint } from "@/lib/services/print";
import { formatCurrency } from "@/lib/utils";
import { BillPrint, type BillData } from "@/components/print/BillPrint";
import { WhatsAppSend } from "@/components/print/WhatsAppSend";

export default async function PrintBillPage({
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

  if (!order.invoice) notFound();

  const qrText = `${order.orderNumber}|${order.customer.name}|${order.total}|${order.invoice.invoiceNumber}`;
  const qrCode = await QRCode.toDataURL(qrText, { width: 200 });

  const bill: BillData = {
    shopName: settings.shopName,
    address: settings.address,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    currency: settings.currency,
    invoiceNumber: order.invoice.invoiceNumber,
    orderNumber: order.orderNumber,
    date: order.orderDate,
    orderDate: order.orderDate,
    collectionDate: order.collectionDate,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    items: order.items.map((i) => ({
      productName: i.productName,
      subType: i.subType,
      quantity: i.quantity,
      price: i.price,
      total: i.total,
      customerName: i.customer?.name || undefined,
      customerPhone: i.customer?.phone || undefined,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    paid: order.paid,
    balance: order.balance,
    qrCode,
  };

  const waMessage = [
    `${settings.shopName} — Invoice`,
    `Invoice No: ${bill.invoiceNumber}`,
    `Order No: ${bill.orderNumber}`,
    `Customer: ${bill.customerName}`,
    `Phone: ${bill.customerPhone}`,
    `Date: ${format(new Date(bill.date), "dd MMM yyyy")}`,
    ``,
    `Items:`,
    ...bill.items.map((i) =>
      i.customerName ? `${i.customerName}: ${i.productName} x${i.quantity}` : `${i.productName} x${i.quantity}`
    ),
    ``,
    `Subtotal: ${formatCurrency(bill.subtotal, bill.currency)}`,
    `Discount: ${formatCurrency(bill.discount, bill.currency)}`,
    `TOTAL: ${formatCurrency(bill.total, bill.currency)}`,
    `PAID: ${formatCurrency(bill.paid, bill.currency)}`,
    `BALANCE: ${formatCurrency(bill.balance, bill.currency)}`,
    `Collection Date: ${format(new Date(bill.collectionDate || bill.date), "dd MMM yyyy")}`,
    ``,
    `Note: Article not collected within 30 days shall be considered unclaimed.`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <WhatsAppSend
        message={waMessage}
        shopWhatsapp={settings.whatsapp}
        printLabel="Print Bill"
        downloadName={`bill-${bill.invoiceNumber}.png`}
      >
        <BillPrint bill={bill} />
      </WhatsAppSend>
    </div>
  );
}
