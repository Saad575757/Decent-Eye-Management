import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getOrderForPrint } from "@/lib/services/print";
import { BillPrint, type BillData } from "@/components/print/BillPrint";
import { PrintButton } from "@/components/print/PrintButton";

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
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
      total: i.total,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    paid: order.paid,
    balance: order.balance,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="flex justify-center print:hidden">
        <PrintButton label="Print Bill" />
      </div>
      <div className="mt-4 print:mt-0">
        <BillPrint bill={bill} />
      </div>
    </div>
  );
}
