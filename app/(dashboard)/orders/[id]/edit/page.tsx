import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";
import { PageHeader } from "@/components/PageHeader";
import { EditOrderForm } from "./EditOrderForm";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        prescriptions: true,
      },
    }),
    getSettings(),
  ]);
  if (!order) notFound();

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      customerNumber: true,
      name: true,
      phone: true,
    },
  });

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      brand: true,
      sellingPrice: true,
      stock: true,
      category: true,
    },
  });

  return (
    <div>
      <PageHeader
        title={`Edit Order ${order.orderNumber}`}
        subtitle={`Customer: ${order.customer.name}`}
      />
      <div className="p-4 sm:p-6">
        <EditOrderForm
          orderId={order.id}
          customers={customers}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            sellingPrice: p.sellingPrice,
            stock: p.stock,
            category: p.category,
          }))}
          currency={settings.currency}
          existing={{
            customerId: order.customerId,
            orderDate: order.orderDate,
            collectionDate: order.collectionDate,
            items: order.items.map((i) => ({
              customerId: i.customerId || undefined,
              productId: i.productId || undefined,
              productName: i.productName,
              category: i.category,
              subType: i.subType || undefined,
              quantity: i.quantity,
              price: i.price,
            })),
            prescription:
              order.prescriptions[0] && {
                rightSphere: order.prescriptions[0].rightSphere || "",
                rightCylinder: order.prescriptions[0].rightCylinder || "",
                rightAxis: order.prescriptions[0].rightAxis || "",
                rightAdd: order.prescriptions[0].rightAdd || "",
                rightPD: order.prescriptions[0].rightPD || "",
                leftSphere: order.prescriptions[0].leftSphere || "",
                leftCylinder: order.prescriptions[0].leftCylinder || "",
                leftAxis: order.prescriptions[0].leftAxis || "",
                leftAdd: order.prescriptions[0].leftAdd || "",
                leftPD: order.prescriptions[0].leftPD || "",
                notes: order.prescriptions[0].notes || "",
              },
            discount: order.discount,
            paid: order.paid,
            paymentMethod: order.paymentMethod || "Cash",
            notes: order.notes || "",
            status: order.status,
          }}
        />
      </div>
    </div>
  );
}