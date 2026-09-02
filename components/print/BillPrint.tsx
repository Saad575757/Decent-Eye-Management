import { Fragment } from "react";
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
    subType?: string | null;
    quantity: number;
    price: number;
    total: number;
    customerName?: string | null;
    customerPhone?: string | null;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  qrCode?: string;
  orderDate?: Date;
  collectionDate?: Date;
}

export function BillPrint({ bill }: { bill: BillData }) {
  return (
    <div className="mx-auto w-[80mm] bg-white px-3 py-5 text-black">
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decent-eye-logo.png"
          alt={bill.shopName}
          className="h-24 w-auto object-contain"
        />
      </div>

      <div className="mt-2 flex items-start justify-between gap-2 text-xs">
        <div className="space-y-0.5">
          <div>
            <span className="font-semibold">Invoice:</span> {bill.invoiceNumber}
          </div>
          <div>
            <span className="font-semibold">Order:</span> {bill.orderNumber}
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

      <div className="my-3 border-t border-dashed border-gray-400" />

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1 text-left font-semibold">Item</th>
            <th className="py-1 text-right font-semibold">Qty</th>
            <th className="py-1 text-right font-semibold">Amt</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, idx) => {
            const prev = bill.items[idx - 1];
            const showHeader =
              !prev ||
              (item.customerName || "") !== (prev.customerName || "");
            return (
              <Fragment key={idx}>
                {showHeader && (
                  <tr>
                    <td
                      colSpan={3}
                      className="border-b border-black bg-gray-100 py-1 font-semibold uppercase"
                    >
                      {item.customerName || bill.customerName}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-gray-200 align-top">
                  <td className="py-1">
                    {item.productName}
                    {item.subType && (
                      <div className="text-[10px] text-gray-600 capitalize">
                        {item.subType.toLowerCase()}
                      </div>
                    )}
                  </td>
                  <td className="py-1 text-right">{item.quantity}</td>
                  <td className="py-1 text-right">
                    {formatCurrency(item.total, bill.currency)}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="mt-2 ml-auto w-48 space-y-0.5 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(bill.subtotal, bill.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>{formatCurrency(bill.discount, bill.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-0.5 font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(bill.total, bill.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Paid</span>
          <span>{formatCurrency(bill.paid, bill.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-0.5 font-bold">
          <span>Balance</span>
          <span>{formatCurrency(bill.balance, bill.currency)}</span>
        </div>
      </div>

      {bill.qrCode && (
        <div className="mt-3 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bill.qrCode} alt="QR code" className="h-24 w-24" />
          <p className="mt-1 text-[10px]">Scan to verify order</p>
        </div>
      )}

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="text-center text-[10px] leading-relaxed">
        <p>Shop No. 8, Farhan Tower, Block-10/A,</p>
        <p>Near Toyota Showroom Gulshan-e-Iqbal, Karachi.</p>
        <p>Cell: 0308-2246251, 0337-3161788</p>
        <p>Email: faizangha808@gmail.com</p>
        <p>Website: shamaoptics.blogspot.com</p>
      </div>

      <div className="my-2 border-t-2 border-double border-gray-800 pt-2 text-center">
        <p className="text-[10px] font-medium uppercase tracking-wider">
          Collection Date
        </p>
        <p className="text-lg font-black tracking-wider">
          {format(new Date(bill.collectionDate || bill.date), "dd MMM yyyy").toUpperCase()}
        </p>
      </div>

      <div className="text-center text-[10px] font-semibold leading-snug">
        Note: Article not collected within 30 days shall
        <br />
        be considered unclaimed.
      </div>
    </div>
  );
}
