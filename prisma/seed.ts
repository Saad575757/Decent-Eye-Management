import { PrismaClient, OrderStatus } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

async function main() {
  console.log("Seeding DECENT EYE database...");

  // Clear existing data (in dependency order)
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.businessSettings.deleteMany();

  // Business Settings
  await prisma.businessSettings.create({
    data: {
      id: "default",
      shopName: "Decent Eye",
      phone: "0300-1234567",
      whatsapp: "0300-1234567",
      address: "Shop #10, Main Market, Lahore, Pakistan",
      email: "info@decenteye.local",
      currency: "PKR",
      defaultCollectionDays: 3,
      lowStockThreshold: 5,
    },
  });

  // Customers (10)
  const customerData = [
    { name: "Muhammad Ali", phone: "03001234567", whatsapp: "03001234567", address: "H-12, Islamabad" },
    { name: "Ayesha Khan", phone: "03011234567", whatsapp: "03011234567", address: "F-8, Islamabad" },
    { name: "Ahmed Raza", phone: "03021234567", whatsapp: "", address: "Model Town, Lahore" },
    { name: "Sana Malik", phone: "03031234567", whatsapp: "03031234567", address: "Gulberg, Lahore" },
    { name: "Usman Tariq", phone: "03041234567", whatsapp: "", address: "Clifton, Karachi" },
    { name: "Fatima Noor", phone: "03051234567", whatsapp: "03051234567", address: "DHA, Karachi" },
    { name: "Bilal Ahmed", phone: "03061234567", whatsapp: "", address: "Saddar, Rawalpindi" },
    { name: "Hira Shah", phone: "03071234567", whatsapp: "03071234567", address: "Bahria Town, Rawalpindi" },
    { name: "Omar Farooq", phone: "03081234567", whatsapp: "", address: "Cantt, Peshawar" },
    { name: "Zainab Ali", phone: "03091234567", whatsapp: "03091234567", address: "University Road, Multan" },
  ];

  const customers = [];
  for (let i = 0; i < customerData.length; i++) {
    const c = await prisma.customer.create({
      data: {
        customerNumber: `CUS-${pad(i + 1, 4)}`,
        name: customerData[i].name,
        phone: customerData[i].phone,
        whatsapp: customerData[i].whatsapp || null,
        address: customerData[i].address,
        notes: null,
      },
    });
    customers.push(c);
  }

  // Products: Frames
  const frames = [
    { name: "Classic Black Metal Frame", brand: "Vision", price: 5000, stock: 10 },
    { name: "Brown Plastic Frame", brand: "Ray-Ban", price: 4500, stock: 8 },
    { name: "Gold Rimless Frame", brand: "Prada", price: 8000, stock: 3 },
    { name: "Blue Transparent Frame", brand: "Locals", price: 3500, stock: 12 },
    { name: "Matte Black Sport Frame", brand: "Vision", price: 6000, stock: 6 },
    { name: "Round Vintage Frame", brand: "Retro", price: 4200, stock: 5 },
  ];

  // Lenses
  const lenses = [
    { name: "Single Vision Lens", brand: "ABC", price: 2500, stock: 20 },
    { name: "Blue Cut Lens", brand: "ABC", price: 4000, stock: 15 },
    { name: "Photochromic Lens", brand: "Essilor", price: 7000, stock: 8 },
    { name: "Progressive Lens", brand: "Essilor", price: 12000, stock: 6 },
    { name: "Bifocal Lens", brand: "Crizal", price: 6500, stock: 9 },
    { name: "Anti-Reflective Lens", brand: "Crizal", price: 5000, stock: 10 },
  ];

  // Sunglasses
  const sunglasses = [
    { name: "Classic Black Sunglasses", brand: "Vision", price: 3500, stock: 8 },
    { name: "Aviator Gold Sunglasses", brand: "Ray-Ban", price: 8000, stock: 4 },
    { name: "Retro Round Sunglasses", brand: "Locals", price: 2800, stock: 10 },
    { name: "Sport Wrap Sunglasses", brand: "Nike", price: 6500, stock: 2 },
    { name: "Women's Cat Eye Sunglasses", brand: "Prada", price: 9500, stock: 5 },
  ];

  // Accessories
  const accessories = [
    { name: "Premium Glasses Case", brand: "Decent", price: 500, stock: 20 },
    { name: "Standard Glasses Case", brand: "Decent", price: 300, stock: 30 },
    { name: "Cleaning Cloth", brand: "Decent", price: 150, stock: 40 },
    { name: "Cleaning Spray", brand: "Decent", price: 400, stock: 12 },
    { name: "Glasses Chain", brand: "Decent", price: 800, stock: 7 },
    { name: "Nose Pads", brand: "Decent", price: 100, stock: 25 },
  ];

  const productIdMap: Record<string, { id: string; name: string; price: number; stock: number }> = {};

  for (const f of frames)
    productIdMap[f.name] = {
      id: (
        await prisma.product.create({
          data: { name: f.name, category: "FRAME", brand: f.brand, sellingPrice: f.price, purchasePrice: Math.round(f.price * 0.6), stock: f.stock },
        })
      ).id,
      name: f.name,
      price: f.price,
      stock: f.stock,
    };
  for (const l of lenses)
    productIdMap[l.name] = {
      id: (
        await prisma.product.create({
          data: { name: l.name, category: "LENS", brand: l.brand, sellingPrice: l.price, purchasePrice: Math.round(l.price * 0.55), stock: l.stock },
        })
      ).id,
      name: l.name,
      price: l.price,
      stock: l.stock,
    };
  for (const s of sunglasses)
    productIdMap[s.name] = {
      id: (
        await prisma.product.create({
          data: { name: s.name, category: "SUNGLASSES", brand: s.brand, sellingPrice: s.price, purchasePrice: Math.round(s.price * 0.6), stock: s.stock },
        })
      ).id,
      name: s.name,
      price: s.price,
      stock: s.stock,
    };
  for (const a of accessories)
    productIdMap[a.name] = {
      id: (
        await prisma.product.create({
          data: { name: a.name, category: "ACCESSORY", brand: a.brand, sellingPrice: a.price, purchasePrice: Math.round(a.price * 0.5), stock: a.stock },
        })
      ).id,
      name: a.name,
      price: a.price,
      stock: a.stock,
    };

  // Sample orders with different statuses and payments
  const sampleOrders = [
    {
      customerIndex: 0,
      status: "PAID" as OrderStatus,
      items: [productIdMap["Classic Black Metal Frame"], productIdMap["Blue Cut Lens"], productIdMap["Premium Glasses Case"]],
      discount: 500,
      paidRatio: 0.5,
      daysAgo: 3,
      prescription: {
        rightSphere: "-1.50", rightCylinder: "-0.50", rightAxis: "90", rightPD: "31",
        leftSphere: "-1.25", leftCylinder: "-0.75", leftAxis: "85", leftPD: "31",
      },
    },
    {
      customerIndex: 1,
      status: "PAID" as OrderStatus,
      items: [productIdMap["Brown Plastic Frame"], productIdMap["Progressive Lens"]],
      discount: 0,
      paidRatio: 1,
      daysAgo: 1,
      prescription: {
        rightSphere: "+1.25", rightCylinder: "-0.25", rightAxis: "180", rightPD: "62",
        leftSphere: "+1.50", leftCylinder: "-0.50", leftAxis: "10", leftPD: "62",
      },
    },
    {
      customerIndex: 2,
      status: "PAID" as OrderStatus,
      items: [productIdMap["Classic Black Sunglasses"], productIdMap["Cleaning Cloth"]],
      discount: 100,
      paidRatio: 1,
      daysAgo: 10,
      prescription: null,
    },
    {
      customerIndex: 3,
      status: "ADVANCED" as OrderStatus,
      items: [productIdMap["Gold Rimless Frame"], productIdMap["Photochromic Lens"], productIdMap["Glasses Chain"]],
      discount: 1000,
      paidRatio: 0.25,
      daysAgo: 0,
      prescription: {
        rightSphere: "-3.00", rightCylinder: "-1.00", rightAxis: "75", rightPD: "60",
        leftSphere: "-2.75", leftCylinder: "-0.75", leftAxis: "80", leftPD: "60",
      },
    },
    {
      customerIndex: 4,
      status: "ADVANCED" as OrderStatus,
      items: [productIdMap["Matte Black Sport Frame"], productIdMap["Anti-Reflective Lens"]],
      discount: 0,
      paidRatio: 0.6,
      daysAgo: 2,
      prescription: {
        rightSphere: "-0.50", rightCylinder: "", rightAxis: "", rightPD: "63",
        leftSphere: "-0.75", leftCylinder: "", leftAxis: "", leftPD: "63",
      },
    },
    {
      customerIndex: 5,
      status: "PAID" as OrderStatus,
      items: [productIdMap["Round Vintage Frame"], productIdMap["Single Vision Lens"], productIdMap["Cleaning Spray"]],
      discount: 200,
      paidRatio: 1,
      daysAgo: 20,
      prescription: {
        rightSphere: "+2.00", rightCylinder: "-0.50", rightAxis: "90", rightPD: "31",
        leftSphere: "+2.25", leftCylinder: "-0.25", leftAxis: "95", leftPD: "31",
      },
    },
    {
      customerIndex: 6,
      status: "CANCELLED" as OrderStatus,
      items: [productIdMap["Aviator Gold Sunglasses"]],
      discount: 0,
      paidRatio: 0,
      daysAgo: 5,
      prescription: null,
    },
    {
      customerIndex: 7,
      status: "ADVANCED" as OrderStatus,
      items: [productIdMap["Blue Transparent Frame"], productIdMap["Bifocal Lens"]],
      discount: 300,
      paidRatio: 0,
      daysAgo: 0,
      prescription: {
        rightSphere: "-5.00", rightCylinder: "-1.50", rightAxis: "15", rightPD: "58",
        leftSphere: "-4.75", leftCylinder: "-1.25", leftAxis: "20", leftPD: "58",
      },
    },
    {
      customerIndex: 8,
      status: "ADVANCED" as OrderStatus,
      items: [productIdMap["Women's Cat Eye Sunglasses"]],
      discount: 0,
      paidRatio: 0.5,
      daysAgo: 2,
      prescription: null,
    },
    {
      customerIndex: 9,
      status: "ADVANCED" as OrderStatus,
      items: [productIdMap["Round Vintage Frame"], productIdMap["Blue Cut Lens"], productIdMap["Premium Glasses Case"]],
      discount: 150,
      paidRatio: 0.8,
      daysAgo: 4,
      prescription: {
        rightSphere: "-0.25", rightCylinder: "-0.25", rightAxis: "100", rightPD: "61",
        leftSphere: "-0.50", leftCylinder: "-0.50", leftAxis: "80", leftPD: "61",
      },
    },
  ];

  const year = new Date().getFullYear();
  for (let i = 0; i < sampleOrders.length; i++) {
    const s = sampleOrders[i];
    const customer = customers[s.customerIndex];
    const orderNumber = `ORD-${year}-${pad(i + 1, 4)}`;
    const invoiceNumber = `INV-${year}-${pad(i + 1, 4)}`;

    const subtotal = s.items.reduce((sum, it) => sum + it.price, 0);
    const total = subtotal - s.discount;
    const paid = Math.round(total * s.paidRatio);
    const balance = total - paid;

    const orderDate = addDays(new Date(), -s.daysAgo);
    const collectionDate = addDays(orderDate, 3);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        orderDate,
        collectionDate,
        subtotal,
        discount: s.discount,
        total,
        paid,
        balance,
        paymentMethod: paid > 0 ? "Cash" : null,
        status: s.status,
        notes: null,
        items: {
          create: s.items.map((it) => ({
            productId: it.id,
            productName: it.name,
            category: it.name.includes("Lens") ? "LENS" : it.name.includes("Frame") ? "FRAME" : it.name.includes("Sunglasses") ? "SUNGLASSES" : "ACCESSORY",
            quantity: 1,
            price: it.price,
            total: it.price,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.invoice.create({
      data: { invoiceNumber, orderId: order.id, customerId: customer.id, date: orderDate, subtotal, discount: s.discount, total },
    });

    if (s.prescription) {
      await prisma.prescription.create({
        data: { customerId: customer.id, orderId: order.id, ...s.prescription },
      });
    }

    if (paid > 0) {
      await prisma.payment.create({
        data: { orderId: order.id, amount: paid, paymentMethod: "Cash", date: orderDate, notes: "Initial payment" },
      });
    }
  }

  console.log("Seeding complete ✔");
  console.log("\n--- Login ---");
  console.log("Email:    admin@decenteye.local");
  console.log("Password: Admin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
