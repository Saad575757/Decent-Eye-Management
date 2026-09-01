import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import EditCustomerClient from "./EditCustomerClient";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <EditCustomerClient
      id={customer.id}
      name={customer.name}
      phone={customer.phone}
      whatsapp={customer.whatsapp}
      address={customer.address}
      notes={customer.notes}
    />
  );
}
