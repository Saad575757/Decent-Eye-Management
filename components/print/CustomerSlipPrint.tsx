import { format } from "date-fns";
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
  items: string[];
  total: number;
  paid: number;
  balance: number;
}

export function CustomerSlipPrint({ slip }: { slip: SlipData }) {
  return (
    <div className="mx-auto max-w-sm bg-white px-6 py-8 text-black">
      <div className="text-center">
        <h1 className="text-3xl font-bold uppercase tracking-widest">
          {slip.shopName}
        </h1>
        <p className="text-sm">Optical Shop</p>
        {(slip.phone || slip.whatsapp) && (
          <p className="mt-1 text-sm">
            {slip.phone && <>Phone: {slip.phone}</>}
            {slip.phone && slip.whatsapp && <br />}
            {slip.whatsapp && <>WhatsApp: {slip.whatsapp}</>}
          </p>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-lg font-semibold uppercase tracking-wide">
          Customer Slip
        </p>
      </div>

      <div className="mt-4 space-y-1 text-sm">
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
        <div className="flex justify-between">
          <span>Order Date:</span>
          <span>{format(new Date(slip.orderDate), "dd MMM yyyy")}</span>
        </div>
      </div>

      <div className="my-4 border-b border-dashed border-gray-400" />

      <div className="text-sm">
        <p className="font-semibold">Items</p>
        <div className="mt-1 space-y-0.5">
          {slip.items.map((item, idx) => (
            <div key={idx}>• {item}</div>
          ))}
        </div>
      </div>

      <div className="my-4 border-b border-dashed border-gray-400" />

      <div className="space-y-1 text-sm font-medium">
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

      <div className="my-6 border-y-2 border-double border-gray-800 py-4 text-center">
        <p className="text-xs font-medium uppercase tracking-widest">
          Collection Date
        </p>
        <p className="mt-1 text-3xl font-black tracking-wider">
          {format(new Date(slip.collectionDate), "dd MMM yyyy").toUpperCase()}
        </p>
      </div>

      <div className="text-center text-xs">
        <p className="font-semibold">
          Please bring this slip when collecting your glasses.
        </p>
        <p className="mt-1">
          Thank you for choosing {slip.shopName}.
        </p>
      </div>
    </div>
  );
}
