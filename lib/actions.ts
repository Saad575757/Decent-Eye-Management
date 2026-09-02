"use server";

import { revalidatePath } from "next/cache";
import { format, addDays } from "date-fns";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import {
  orderSchema,
  productSchema,
  paymentSchema,
  settingsSchema,
  customerSchema,
  quickCustomerSchema,
  quickOrderSchema,
  type ProductInput,
  type PaymentInput,
  type SettingsInput,
  type QuickOrderInput,
} from "@/lib/validations";
import { createOrder } from "@/lib/services/orders";
import { generateCustomerNumber } from "@/lib/services/numbers";
import { getSettings } from "@/lib/services/settings";

export async function createOrderAction(formData: unknown) {
  try {
    await requireAuth();
    const parsed = orderSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const result = await createOrder(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath("/customers");
    return { ok: true, orderId: result.order.id, orderNumber: result.order.orderNumber };
  } catch (err) {
    console.error("createOrder error:", err);
    return {
      ok: false,
      error:
        (err as Error).message?.includes("stock")
          ? (err as Error).message
          : "Unable to create order. Please try again.",
    };
  }
}

export async function createQuickOrderAction(formData: unknown) {
  try {
    await requireAuth();
    const parsed = quickOrderSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const data = parsed.data as QuickOrderInput;

    let customerId = "";
    let createdCustomer = false;
    const existing = await prisma.customer.findFirst({
      where: { phone: data.customerPhone },
    });

    if (existing) {
      customerId = existing.id;
    } else {
      const customerNumber = await generateCustomerNumber();
      const customer = await prisma.customer.create({
        data: {
          customerNumber,
          name: data.customerPhone,
          phone: data.customerPhone,
        },
      });
      customerId = customer.id;
      createdCustomer = true;
    }

    const familyIds: string[] = [];
    for (const member of data.familyMembers || []) {
      let id = "";
      if (member.phone) {
        const ex = await prisma.customer.findFirst({
          where: { phone: member.phone },
        });
        if (ex) id = ex.id;
      }
      if (!id) {
        const customerNumber = await generateCustomerNumber();
        const customer = await prisma.customer.create({
          data: {
            customerNumber,
            name: member.name?.trim() || member.phone?.trim() || "Family Member",
            phone: member.phone?.trim() || "",
            whatsapp: member.whatsapp?.trim() || null,
            address: member.address?.trim() || null,
            notes: member.notes?.trim() || null,
          },
        });
        id = customer.id;
      }
      familyIds.push(id);
    }

    const itemCustomerId = (ref?: string): string | undefined => {
      const idx = parseInt(ref || "0", 10);
      if (idx === 0 || !Number.isFinite(idx)) return customerId;
      if (idx > 0 && familyIds[idx - 1]) return familyIds[idx - 1];
      return customerId;
    };

    const settings = await getSettings();
    const orderDate = new Date();
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const result = await createOrder({
      customerId,
      orderDate: format(orderDate, "yyyy-MM-dd"),
      collectionDate: format(
        addDays(orderDate, settings.defaultCollectionDays),
        "yyyy-MM-dd"
      ),
      discount: 0,
      paid: data.advance,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      items: data.items.map((item) => ({
        productId: item.productId || undefined,
        customerId: itemCustomerId(item.customerId),
        productName: item.productName,
        category: item.category,
        subType: item.subType || undefined,
        quantity: item.quantity,
        price: item.price,
      })),
      prescription: data.prescription || undefined,
    }, (data.customerPrescriptions || [])
      .map((cp) => ({
        customerId: itemCustomerId(cp.customerId) || customerId,
        prescription: cp.prescription as Record<string, string | undefined>,
      }))
      .filter((cp) => cp.prescription && Object.values(cp.prescription).some(Boolean)));

    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath("/customers");
    return {
      ok: true,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      createdCustomer,
    };
  } catch (err) {
    console.error("createQuickOrder error:", err);
    return {
      ok: false,
      error:
        (err as Error).message?.includes("stock")
          ? (err as Error).message
          : "Unable to create order. Please try again.",
    };
  }
}

export async function createCustomerAction(formData: unknown) {
  try {
    await requireAuth();
    const parsed = customerSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const customerNumber = await generateCustomerNumber();
    const customer = await prisma.customer.create({
      data: {
        customerNumber,
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        whatsapp: parsed.data.whatsapp?.trim() || null,
        address: parsed.data.address?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    revalidatePath("/customers");
    return { ok: true, id: customer.id };
  } catch (err) {
    console.error("createCustomer error:", err);
    return { ok: false, error: "Unable to create customer. Please try again." };
  }
}

export async function createQuickCustomerAction(formData: unknown) {
  try {
    await requireAuth();
    const parsed = quickCustomerSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const customerNumber = await generateCustomerNumber();
    const customer = await prisma.customer.create({
      data: {
        customerNumber,
        name: parsed.data.name?.trim() || "",
        phone: parsed.data.phone?.trim() || "",
        whatsapp: parsed.data.whatsapp?.trim() || null,
        address: parsed.data.address?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    revalidatePath("/customers");
    return { ok: true, id: customer.id };
  } catch (err) {
    console.error("createQuickCustomer error:", err);
    return { ok: false, error: "Unable to create customer. Please try again." };
  }
}

export async function updateCustomerAction(id: string, formData: unknown) {
  try {
    await requireAuth();
    const parsed = customerSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    await prisma.customer.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        whatsapp: parsed.data.whatsapp?.trim() || null,
        address: parsed.data.address?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
      },
    });
    revalidatePath("/customers");
    return { ok: true };
  } catch (err) {
    console.error("updateCustomer error:", err);
    return { ok: false, error: "Unable to update customer. Please try again." };
  }
}

export async function createProductAction(formData: unknown) {
  try {
    await requireAuth();
    const parsed = productSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const data = parsed.data as ProductInput;
    await prisma.product.create({
      data: {
        name: data.name.trim(),
        category: data.category,
        brand: (data.brand as string)?.trim() || null,
        description: (data.description as string)?.trim() || null,
        sellingPrice: Number(data.sellingPrice),
        purchasePrice: data.purchasePrice
          ? Number(data.purchasePrice)
          : null,
        stock: Number(data.stock) || 0,
      },
    });
    revalidatePath("/products");
    return { ok: true };
  } catch (err) {
    console.error("createProduct error:", err);
    return { ok: false, error: "Unable to save product. Please try again." };
  }
}

export async function updateProductAction(id: string, formData: unknown) {
  try {
    await requireAuth();
    const parsed = productSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const data = parsed.data as ProductInput;
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name.trim(),
        category: data.category,
        brand: (data.brand as string)?.trim() || null,
        description: (data.description as string)?.trim() || null,
        sellingPrice: Number(data.sellingPrice),
        purchasePrice: data.purchasePrice
          ? Number(data.purchasePrice)
          : null,
        stock: Number(data.stock) || 0,
      },
    });
    revalidatePath("/products");
    revalidatePath("/orders");
    return { ok: true };
  } catch (err) {
    console.error("updateProduct error:", err);
    return { ok: false, error: "Unable to update product. Please try again." };
  }
}

export async function addPaymentAction(orderId: string, formData: unknown) {
  try {
    await requireAuth();
    const parsed = paymentSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const data = parsed.data as PaymentInput;
    const amount = Number(data.amount);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");

      if (amount > order.balance) {
        throw new Error("Amount cannot be greater than balance");
      }

      await tx.payment.create({
        data: {
          orderId,
          amount,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
        },
      });

      const newPaid = order.paid + amount;
      const newBalance = order.total - newPaid;
      await tx.order.update({
        where: { id: orderId },
        data: {
          paid: newPaid,
          balance: newBalance,
          paymentMethod: data.paymentMethod,
          status: newBalance === 0 ? "PAID" : "ADVANCED",
        },
      });

      return { newPaid, newBalance, total: order.total };
    });

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath(`/orders/${orderId}`);
    return { ok: true, ...result };
  } catch (err) {
    console.error("addPayment error:", err);
    return {
      ok: false,
      error:
        (err as Error).message?.includes("balance")
          ? (err as Error).message
          : "Unable to save payment. Please try again.",
    };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await requireAuth();
    const validStatuses = ["ADVANCED", "PAID", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return { ok: false, error: "Invalid status" };
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as never },
    });
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath("/customers");
    return { ok: true };
  } catch (err) {
    console.error("updateStatus error:", err);
    return { ok: false, error: "Unable to update status. Please try again." };
  }
}

export async function updateSettingsAction(formData: unknown) {
  try {
    await requireAuth();
    const parsed = settingsSchema.safeParse(formData);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors[0]?.message || "Invalid data" };
    }
    const data = parsed.data as SettingsInput;
    await prisma.businessSettings.upsert({
      where: { id: "default" },
      update: {
        shopName: data.shopName.trim(),
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        address: data.address || null,
        email: data.email || null,
        currency: data.currency || "PKR",
        defaultCollectionDays: Number(data.defaultCollectionDays),
        lowStockThreshold: Number(data.lowStockThreshold),
      },
      create: {
        id: "default",
        shopName: data.shopName.trim(),
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        address: data.address || null,
        email: data.email || null,
        currency: data.currency || "PKR",
        defaultCollectionDays: Number(data.defaultCollectionDays),
        lowStockThreshold: Number(data.lowStockThreshold),
      },
    });
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("updateSettings error:", err);
    return { ok: false, error: "Unable to save settings. Please try again." };
  }
}
