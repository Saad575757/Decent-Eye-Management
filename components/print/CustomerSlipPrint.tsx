import { format } from "date-fns";
import { Facebook, Instagram } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface SlipData {
  shopName: string;
  phone?: string | null;
  whatsapp?: string | null;
  currency: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderDate: Date;
  collectionDate: Date;
  items: {
    customerName?: string | null;
    label: string;
  }[];
  total: number;
  paid: number;
  balance: number;
}

export function CustomerSlipPrint({ slip }: { slip: SlipData }) {
  return (
    <div className="mx-auto w-[72mm] bg-white px-3 py-5 text-black">
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decent-eye-logo.png"
          alt={slip.shopName}
          className="h-24 w-auto object-contain"
        />
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide">
          Customer Slip
        </p>
      </div>

      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Order No:</span>
          <span className="font-semibold">{slip.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span className="font-semibold">{slip.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span>Phone:</span>
          <span>{slip.customerPhone}</span>
        </div>
      </div>

      <div className="my-3 border-b border-dashed border-gray-400" />

      <div className="text-xs">
        <p className="font-semibold">Items</p>
        <div className="mt-1 space-y-0.5">
          {slip.items.map((item, idx) => {
            const prev = slip.items[idx - 1];
            const showHeader =
              !prev ||
              (item.customerName || "") !== (prev.customerName || "");
            return (
              <div key={idx}>
                {/* {showHeader && item.customerName && (
                  <p className="mt-1 font-semibold uppercase first:mt-0">
                    {item.customerName}
                  </p>
                )} */}
                <div>• {item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="my-3 border-b border-dashed border-gray-400" />

      <div className="ml-auto w-44 space-y-0.5 text-xs font-medium">
        <div className="flex justify-between">
          <span>TOTAL:</span>
          <span>{formatCurrency(slip.total, slip.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>PAID:</span>
          <span>{formatCurrency(slip.paid, slip.currency)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>BALANCE:</span>
          <span>{formatCurrency(slip.balance, slip.currency)}</span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="my-3 border-y-2 border-double border-gray-800 py-3 text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest">
          Collection Date
        </p>
        <p className="text-xl font-black tracking-wider">
          {format(new Date(slip.collectionDate), "dd MMM yyyy").toUpperCase()}
        </p>
      </div>

      <div className="text-center text-[10px] leading-relaxed">
        <p>Shop No. 8, Farhan Tower, Block-10/A,</p>
        <p>Near Toyota Showroom Gulshan-e-Iqbal, Karachi.</p>
        <p>Cell: 0308-2246251, 0337-3161788</p>
      </div>

      <div className="mt-2 text-center text-[10px] font-semibold leading-snug">
        Note: Article not collected within 30 days shall
        <br />
        be considered unclaimed.
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-black">
        <Facebook className="h-4 w-4" />
        <Instagram className="h-4 w-4" />
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      </div>
    </div>
  );
}
