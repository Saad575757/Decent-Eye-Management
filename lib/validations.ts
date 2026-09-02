import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(120),
  phone: z.string().min(1, "Phone is required").max(40),
  whatsapp: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const quickCustomerSchema = z.object({
  name: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  whatsapp: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type QuickCustomerInput = z.infer<typeof quickCustomerSchema>;

export const orderItemSchema = z.object({
  productId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  productName: z.string().min(1, "Item name is required"),
  category: z.string().min(1),
  subType: z.string().optional().or(z.literal("")),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
});

export const orderSchema = z
  .object({
    customerId: z.string().min(1, "Please select a customer"),
    orderDate: z.string().min(1),
    collectionDate: z.string().min(1),
    discount: z.number().min(0, "Discount cannot be negative"),
    paid: z.number().min(0, "Paid cannot be negative"),
    paymentMethod: z.string().min(1).default("Cash"),
    notes: z.string().optional().or(z.literal("")),
    items: z
      .array(orderItemSchema)
      .min(1, "Add at least one item to the order"),
    prescription: z
      .object({
        rightSphere: z.string().optional().or(z.literal("")),
        rightCylinder: z.string().optional().or(z.literal("")),
        rightAxis: z.string().optional().or(z.literal("")),
        rightAdd: z.string().optional().or(z.literal("")),
        rightPD: z.string().optional().or(z.literal("")),
        leftSphere: z.string().optional().or(z.literal("")),
        leftCylinder: z.string().optional().or(z.literal("")),
        leftAxis: z.string().optional().or(z.literal("")),
        leftAdd: z.string().optional().or(z.literal("")),
        leftPD: z.string().optional().or(z.literal("")),
        notes: z.string().optional().or(z.literal("")),
      })
      .optional(),
    customer: quickCustomerSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    if (data.discount > subtotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount"],
        message: "Discount cannot be greater than subtotal",
      });
    }
    const total = subtotal - data.discount;
    if (data.paid > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paid"],
        message: "Paid cannot be greater than total",
      });
    }
    const orderDate = new Date(data.orderDate);
    const collectionDate = new Date(data.collectionDate);
    if (collectionDate < orderDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["collectionDate"],
        message: "Collection date cannot be before order date",
      });
    }
  });

export type OrderInput = z.infer<typeof orderSchema>;

export const quickOrderItemSchema = z.object({
  productId: z.string().optional(),
  customerId: z.string().optional(),
  productName: z.string().min(1),
  category: z.string().min(1),
  subType: z.string().optional().or(z.literal("")),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

const rxObject = z.object({
  rightSphere: z.string().optional().or(z.literal("")),
  rightCylinder: z.string().optional().or(z.literal("")),
  rightAxis: z.string().optional().or(z.literal("")),
  rightAdd: z.string().optional().or(z.literal("")),
  rightPD: z.string().optional().or(z.literal("")),
  leftSphere: z.string().optional().or(z.literal("")),
  leftCylinder: z.string().optional().or(z.literal("")),
  leftAxis: z.string().optional().or(z.literal("")),
  leftAdd: z.string().optional().or(z.literal("")),
  leftPD: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const quickOrderSchema = z.object({
  customerPhone: z.string().min(1, "Customer phone is required").max(40),
  familyMembers: z.array(quickCustomerSchema).optional(),
  items: z.array(quickOrderItemSchema).min(1, "Add at least one item"),
  advance: z.number().min(0, "Advance cannot be negative"),
  paymentMethod: z.string().min(1).default("Cash"),
  notes: z.string().optional().or(z.literal("")),
  prescription: rxObject.optional(),
  customerPrescriptions: z
    .array(
      z.object({
        customerId: z.string().optional(),
        prescription: rxObject.optional(),
      })
    )
    .optional(),
});

export type QuickOrderInput = z.infer<typeof quickOrderSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(150),
  category: z.enum(["FRAME", "LENS", "SUNGLASSES", "ACCESSORY"]),
  brand: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  sellingPrice: z.coerce.number().min(0, "Price cannot be negative"),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  paymentMethod: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

export const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  currency: z.string().min(1).max(10),
  defaultCollectionDays: z.coerce
    .number()
    .int()
    .min(0)
    .max(365)
    .default(3),
  lowStockThreshold: z.coerce.number().int().min(0).max(1000).default(5),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
