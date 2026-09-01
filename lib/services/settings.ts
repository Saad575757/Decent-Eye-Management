import { prisma } from "@/lib/db";

const DEFAULT_SETTINGS = {
  shopName: "Decent Eye",
  phone: "",
  whatsapp: "",
  address: "",
  email: "",
  logo: "",
  currency: "PKR",
  defaultCollectionDays: 3,
  lowStockThreshold: 5,
};

export async function getSettings() {
  let settings = await prisma.businessSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: DEFAULT_SETTINGS,
    });
  }
  return settings;
}
