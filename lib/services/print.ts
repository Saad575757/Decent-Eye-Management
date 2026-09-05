import { prisma } from "@/lib/db";

export async function getOrderForPrint(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      invoice: true,
      items: { include: { customer: true } },
      prescriptions: { include: { customer: true } },
    },
  });
  return order;
}
