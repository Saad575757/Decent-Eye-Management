import { prisma } from "@/lib/db";

export async function generateCustomerNumber() {
  const last = await prisma.customer.findFirst({
    orderBy: { customerNumber: "desc" },
    select: { customerNumber: true },
  });
  let next = 1;
  if (last) {
    const match = last.customerNumber.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `CUS-${String(next).padStart(4, "0")}`;
}

export async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const last = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  let next = 1;
  if (last) {
    const match = last.orderNumber.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `ORD-${year}-${String(next).padStart(4, "0")}`;
}

export async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const last = await prisma.invoice.findFirst({
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  let next = 1;
  if (last) {
    const match = last.invoiceNumber.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `INV-${year}-${String(next).padStart(4, "0")}`;
}
