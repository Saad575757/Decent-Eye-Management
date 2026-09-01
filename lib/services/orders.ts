import { prisma } from "@/lib/db";
import { generateCustomerNumber, generateOrderNumber, generateInvoiceNumber } from "./numbers";
import type { OrderInput } from "../validations";

export async function createOrder(data: OrderInput) {
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const total = subtotal - data.discount;
  const balance = total - data.paid;

  if (balance < 0) {
    throw new Error("Paid cannot be greater than total");
  }

  const orderNumber = await generateOrderNumber();
  const invoiceNumber = await generateInvoiceNumber();

  return prisma.$transaction(async (tx) => {
    let customerId = data.customerId;

    if (data.customer && !customerId) {
      const customerNumber = await generateCustomerNumber();
      const customer = await tx.customer.create({
        data: {
          customerNumber,
          name: data.customer.name?.trim() || "",
          phone: data.customer.phone?.trim() || "",
          whatsapp: data.customer.whatsapp?.trim() || null,
          address: data.customer.address?.trim() || null,
          notes: data.customer.notes?.trim() || null,
        },
      });
      customerId = customer.id;
    }

    if (!customerId) {
      throw new Error("Please select a customer");
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        orderDate: new Date(data.orderDate),
        collectionDate: new Date(data.collectionDate),
        subtotal,
        discount: data.discount,
        total,
        paid: data.paid,
        balance,
        paymentMethod: data.paymentMethod,
        status: balance > 0 ? "PENDING" : "PENDING",
        notes: data.notes || null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            productName: item.productName.trim(),
            category: item.category,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
          })),
        },
      },
      include: { items: true },
    });

    if (data.prescription) {
      const p = data.prescription;
      await tx.prescription.create({
        data: {
          customerId,
          orderId: order.id,
          rightSphere: p.rightSphere || null,
          rightCylinder: p.rightCylinder || null,
          rightAxis: p.rightAxis || null,
          rightAdd: p.rightAdd || null,
          rightPD: p.rightPD || null,
          leftSphere: p.leftSphere || null,
          leftCylinder: p.leftCylinder || null,
          leftAxis: p.leftAxis || null,
          leftAdd: p.leftAdd || null,
          leftPD: p.leftPD || null,
          notes: p.notes || null,
        },
      });
    }

    await tx.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerId,
        date: new Date(),
        subtotal,
        discount: data.discount,
        total,
      },
    });

    if (data.paid > 0) {
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: data.paid,
          paymentMethod: data.paymentMethod,
          date: new Date(data.orderDate),
          notes: "Initial payment",
        },
      });
    }

    for (const item of data.items) {
      if (item.productId) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (product && product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.productName}. Available: ${product.stock}`
          );
        }
        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    return { order, customerId };
  });
}
