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
            prescriptions: order.prescriptions
              .filter((rx) => rx.customerId === order.customerId)
              .map((rx) => ({
                rightSphere: rx.rightSphere || "",
                rightCylinder: rx.rightCylinder || "",
                rightAxis: rx.rightAxis || "",
                rightAdd: rx.rightAdd || "",
                rightPD: rx.rightPD || "",
                leftSphere: rx.leftSphere || "",
                leftCylinder: rx.leftCylinder || "",
                leftAxis: rx.leftAxis || "",
                leftAdd: rx.leftAdd || "",
                leftPD: rx.leftPD || "",
                notes: rx.notes || "",
              })),
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