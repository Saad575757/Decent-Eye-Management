import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export interface BillData {
  shopName: string;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  currency: string;
  invoiceNumber: string;
  orderNumber: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
}

export function BillPrint({ bill }: { bill: BillData }) {
  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          {bill.shopName}
        </h1>
        <p className="text-sm">Optical Shop</p>
        {bill.address && <p className="text-sm">{bill.address}</p>}
        <p className="text-sm">
          {bill.phone && <>Phone: {bill.phone}</>}
          {bill.phone && bill.whatsapp && "  "}
          {bill.whatsapp && <>WhatsApp: {bill.whatsapp}</>}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div>
            <span className="font-semibold">Invoice No:</span>{" "}
            {bill.invoiceNumber}
          </div>
          <div>
            <span className="font-semibold">Order No:</span> {bill.orderNumber}
          </div>
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {format(new Date(bill.date), "dd MMM yyyy")}
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold">{bill.customerName}</div>
          <div>{bill.customerPhone}</div>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="py-2 text-left font-semibold">Item</th>
            <th className="py-2 text-right font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Price</th>
            <th className="py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-2">{item.productName}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">
                {formatCurrency(item.price, bill.currency)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(item.total, bill.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(bill.subtotal, bill.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>{formatCurrency(bill.discount, bill.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-1 font-bold">
          <span>Total</span>
          <span>{formatCurrency(bill.total, bill.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid</span>
          <span>{formatCurrency(bill.paid, bill.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-1 font-bold">
          <span>Balance</span>
          <span>{formatCurrency(bill.balance, bill.currency)}</span>
        </div>
      </div>

      <div className="mt-8 text-center text-sm">
        Thank you for choosing {bill.shopName}.
      </div>
    </div>
  );
}
