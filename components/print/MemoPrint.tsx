import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export interface MemoData {
  shopName: string;
  address?: string | null;
  phone?: string | null;
  currency: string;
  orderNumber: string;
  orderDate: Date;
  collectionDate: Date;
  customerName: string;
  customerPhone: string;
  items: {
    productName: string;
    subType?: string | null;
    quantity: number;
    price: number;
    total: number;
    customerName?: string | null;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
}

export function MemoPrint({ memo }: { memo: MemoData }) {
  return (
    <div className="mx-auto w-[132mm] bg-white p-[8mm] text-black [break-inside:avoid]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/decent-eye-logo.png"
            alt={memo.shopName}
            className="h-14 w-auto object-contain"
          />
        </div>
        <div className="text-center">
          <div className="border-[3px] border-black px-6 py-1 text-2xl font-black uppercase tracking-[0.35em]">
            Memo
          </div>
          <div className="mt-0.5 text-[10px] tracking-wider">
            {memo.shopName}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center text-center leading-snug">
        <div className="text-lg font-black uppercase tracking-wide">
          {memo.shopName}
        </div>
        <div className="text-[11px]">
          {memo.address ||
            "Shop No. 8, Farhan Tower, Block-10/A, Near Toyota Showroom, Gulshan-e-Iqbal, Karachi."}
        </div>
        <div className="text-[11px] font-medium">
          {memo.phone || "Cell: 0308-2246251, 0337-3161788"}
        </div>
      </div>

      <div className="my-2.5 border-t-2 border-black" />

      <div className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Memo No:</span>
          <span className="flex-1 border-b border-dashed border-gray-500 pb-0.5 text-right font-medium">
            {memo.orderNumber}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Date:</span>
          <span className="flex-1 border-b border-dashed border-gray-500 pb-0.5 text-right">
            {format(new Date(memo.orderDate), "dd/MM/yyyy")}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-10 gap-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Customer Name:</span>
          <span className="flex-1 border-b border-dashed border-gray-500 pb-0.5 text-right font-medium">
            {memo.customerName}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Phone:</span>
          <span className="flex-1 border-b border-dashed border-gray-500 pb-0.5 text-right">
            {memo.customerPhone}
          </span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-gray-400" />

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border border-gray-400 px-1.5 py-1 font-semibold">
              #</th>
            <th className="border border-gray-400 px-1.5 py-1 font-semibold">
              Item Description
            </th>
            <th className="border border-gray-400 px-1.5 py-1 text-center font-semibold">
              Qty
            </th>
            <th className="border border-gray-400 px-1.5 py-1 font-semibold">
              Type
            </th>
            <th className="border border-gray-400 px-1.5 py-1 text-right font-semibold">
              Price
            </th>
            <th className="border border-gray-400 px-1.5 py-1 text-right font-semibold">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {memo.items.map((item, idx) => (
            <tr key={idx} className="align-top">
              <td className="border border-gray-400 px-1.5 py-1 text-center">
                {idx + 1}
              </td>
              <td className="border border-gray-400 px-1.5 py-1">
                {item.productName}
                {item.customerName && (
                  <div className="text-[10px] text-gray-600">
                    ({item.customerName})
                  </div>
                )}
              </td>
              <td className="border border-gray-400 px-1.5 py-1 text-center">
                {item.quantity}
              </td>
              <td className="border border-gray-400 px-1.5 py-1 capitalize">
                {item.subType ? item.subType.toLowerCase() : "-"}
              </td>
              <td className="border border-gray-400 px-1.5 py-1 text-right">
                {formatCurrency(item.price, memo.currency)}
              </td>
              <td className="border border-gray-400 px-1.5 py-1 text-right font-medium">
                {formatCurrency(item.total, memo.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex justify-end">
        <div className="w-60 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(memo.subtotal, memo.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>{formatCurrency(memo.discount, memo.currency)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-black pt-0.5 text-sm font-black">
            <span>TOTAL</span>
            <span>{formatCurrency(memo.total, memo.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>{formatCurrency(memo.paid, memo.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-black pt-0.5 font-bold">
            <span>Balance</span>
            <span>{formatCurrency(memo.balance, memo.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-500 px-3 py-2 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Collection Date
          </div>
          <div className="mt-0.5 text-xl font-black tracking-wider">
            {format(
              new Date(memo.collectionDate),
              "dd MMM yyyy"
            ).toUpperCase()}
          </div>
        </div>
        <div className="flex flex-col justify-end gap-2.5 px-1 pb-0.5">
          <div className="border-t border-black pt-0.5 text-center text-[10px]">
            Customer Signature
          </div>
          <div className="border-t border-black pt-0.5 text-center text-[10px]">
            Official Stamp
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] leading-relaxed text-gray-700">
        <p>
          Note: Article not collected within <b>30 days</b> shall be
          considered unclaimed.
        </p>
      </div>
    </div>
  );
}