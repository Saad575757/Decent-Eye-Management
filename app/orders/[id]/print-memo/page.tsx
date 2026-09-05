import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getOrderForPrint } from "@/lib/services/print";
import { MemoPrint, type MemoData } from "@/components/print/MemoPrint";
import { WhatsAppSend } from "@/components/print/WhatsAppSend";
import "./print-memo.module.css";

export const metadata: Metadata = {
  title: "",
};

export default async function PrintMemoPage({
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

  const memo: MemoData = {
    shopName: settings.shopName,
    address: settings.address,
    phone: settings.phone,
    currency: settings.currency,
    orderNumber: order.orderNumber,
    orderDate: order.orderDate,
    collectionDate: order.collectionDate,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    items: order.items.map((item) => ({
      productName: item.productName,
      subType: item.subType,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      customerName: item.customer?.name || null,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    paid: order.paid,
    balance: order.balance,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <WhatsAppSend
        message={`${settings.shopName} — Memo\nOrder No: ${memo.orderNumber}\nCustomer: ${memo.customerName}\nPhone: ${memo.customerPhone}\nCollection Date: ${memo.collectionDate.toLocaleDateString()}`}
        recipients={[memo.customerPhone]}
        shopWhatsapp={settings.whatsapp}
        printLabel="Print Memo"
        downloadName={`memo-${memo.orderNumber}.png`}
      >
        <MemoPrint memo={memo} />
      </WhatsAppSend>
    </div>
  );
}