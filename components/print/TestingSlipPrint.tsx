import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export interface TestingSlipPrintData {
  shopName: string;
  currency: string;
  slipNumber: string;
  orderDate: Date;
  customerName: string;
  customerPhone: string;
  rightSphere?: string | null;
  rightCylinder?: string | null;
  rightAxis?: string | null;
  rightAdd?: string | null;
  rightPD?: string | null;
  leftSphere?: string | null;
  leftCylinder?: string | null;
  leftAxis?: string | null;
  leftAdd?: string | null;
  leftPD?: string | null;
  notes?: string | null;
  price: number;
  advance: number;
  remaining: number;
}

function EyeBlock({
  data,
  side,
}: {
  data: TestingSlipPrintData;
  side: "right" | "left";
}) {
  const s = side === "right" ? data.rightSphere : data.leftSphere;
  const c = side === "right" ? data.rightCylinder : data.leftCylinder;
  const a = side === "right" ? data.rightAxis : data.leftAxis;
  const add = side === "right" ? data.rightAdd : data.leftAdd;
  const pd = side === "right" ? data.rightPD : data.leftPD;

  return (
    <div className="rounded-md border border-gray-300 p-3">
      <p className="font-semibold uppercase">
        {side === "right" ? "Right Eye" : "Left Eye"}
      </p>
      <div className="mt-1 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">SPH</span>
          <span className="font-medium">{s || "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">CYL</span>
          <span className="font-medium">{c || "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">AXIS</span>
          <span className="font-medium">{a || "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">ADD</span>
          <span className="font-medium">{add || "—"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">PD</span>
          <span className="font-medium">{pd || "—"}</span>
        </div>
      </div>
    </div>
  );
}

export function TestingSlipPrint({ slip }: { slip: TestingSlipPrintData }) {
  return (
    <div className="-ml-[10mm]  w-[60mm] bg-white px-3 py-2 text-black">
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decent-eye-logo.png"
          alt={slip.shopName}
          className="h-20 w-auto object-contain"
        />
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide">
          Testing Slip
        </p>
      </div>

      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Slip No:</span>
          <span className="font-semibold">{slip.slipNumber}</span>
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
          <span>Date:</span>
          <span>{format(new Date(slip.orderDate), "dd MMM yyyy")}</span>
        </div>
      </div>

      <div className="my-3 border-b border-dashed border-gray-400" />

      <p className="mb-1 text-xs font-semibold uppercase">Eye Prescription</p>
      <div className="grid grid-cols-2 gap-3">
        <EyeBlock data={slip} side="right" />
        <EyeBlock data={slip} side="left" />
      </div>
      {slip.notes && (
        <p className="mt-1 text-xs leading-snug">{slip.notes}</p>
      )}

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="ml-auto w-44 space-y-0.5 text-xs font-medium">
        <div className="flex justify-between">
          <span>Price:</span>
          <span>{formatCurrency(slip.price, slip.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Advance:</span>
          <span>{formatCurrency(slip.advance, slip.currency)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Remaining:</span>
          <span>{formatCurrency(slip.remaining, slip.currency)}</span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="text-center text-[10px] leading-relaxed">
        <p>Shop No. 8, Farhan Tower, Block-10/A,</p>
        <p>Near Toyota Showroom Gulshan-e-Iqbal, Karachi.</p>
        <p>Cell: 0308-2246251, 0337-3161788</p>
      </div>

      <div className="mt-2 text-center text-[10px] font-semibold leading-snug">
        Note: Testing slip must be returned at the time of collection. Article
        not collected within 30 days shall be considered unclaimed.
      </div>
    </div>
  );
}