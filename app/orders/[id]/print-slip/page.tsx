import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { getOrderForPrint } from "@/lib/services/print";
import {
  CustomerSlipPrint,
  type SlipData,
} from "@/components/print/CustomerSlipPrint";
import { PrintButton } from "@/components/print/PrintButton";

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
    items: order.items.map((i) => i.productName),
    total: order.total,
    paid: order.paid,
    balance: order.balance,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="flex justify-center print:hidden">
        <PrintButton label="Print Customer Slip" />
      </div>
      <div className="mt-4 print:mt-0 flex justify-center">
        <CustomerSlipPrint slip={slip} />
      </div>
    </div>
  );
}
