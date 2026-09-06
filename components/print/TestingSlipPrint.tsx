import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export interface TestingSlipPrintData {
  shopName: string;
  address?: string | null;
  phone?: string | null;
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

function RxCell({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-gray-300 px-1 py-1">
      <span className="font-semibold">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

function RxBlock({
  side,
  data,
}: {
  side: "right" | "left";
  data: TestingSlipPrintData;
}) {
  const sphere = side === "right" ? data.rightSphere : data.leftSphere;
  const cyl = side === "right" ? data.rightCylinder : data.leftCylinder;
  const axis = side === "right" ? data.rightAxis : data.leftAxis;
  const add = side === "right" ? data.rightAdd : data.leftAdd;
  const pd = side === "right" ? data.rightPD : data.leftPD;
  return (
    <div className="border-2 border-black">
      <div className="border-b-2 border-black bg-gray-100 px-2 py-0.5 text-center text-[11px] font-black uppercase tracking-widest">
        {side === "right" ? "Right Eye" : "Left Eye"}
      </div>
      <div className="px-1 py-0.5 text-[11px]">
        <RxCell label="SPH" value={sphere} />
        <RxCell label="CYL" value={cyl} />
        <RxCell label="AXIS" value={axis} />
        <RxCell label="ADD" value={add} />
        <RxCell label="PD" value={pd} />
      </div>
    </div>
  );
}

export function TestingSlipPrint({ slip }: { slip: TestingSlipPrintData }) {
  return (
    <div className="mx-auto w-[72mm] bg-white p-[6mm] text-black [break-inside:avoid]">
      <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decent-eye-logo.png"
          alt={slip.shopName}
          className="mx-auto h-20 w-auto object-contain"
        />
        <p className="text-lg font-black uppercase tracking-wide">
          {slip.shopName}
        </p>
        <p className="text-[10px] leading-tight">
          {slip.address ||
            "Shop No. 8, Farhan Tower, Block-10/A, Gulshan-e-Iqbal, Karachi."}
        </p>
        <p className="text-[10px] font-medium">
          {slip.phone || "Cell: 0308-2246251, 0337-3161788"}
        </p>
      </div>

      <div className="my-2 border-t-2 border-black" />

      <div className="flex items-center justify-between">
        <div className="border-2 border-black px-3 py-0.5 text-base font-black uppercase tracking-[0.3em]">
          Testing Slip
        </div>
        <div className="text-right text-[11px]">
          <div>
            <span className="font-semibold">No:</span> {slip.slipNumber}
          </div>
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {format(new Date(slip.orderDate), "dd/MM/yyyy")}
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Customer:</span>
          <span className="flex-1 border-b border-dashed border-gray-500 pb-0.5 text-right font-medium">
            {slip.customerName}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Phone:</span>
          <span className="flex-1 border-b border-dashed border-gray-500 pb-0.5 text-right">
            {slip.customerPhone}
          </span>
        </div>
      </div>

      <div className="my-2 border-t border-dashed border-gray-400" />

      <p className="text-[11px] font-black uppercase tracking-widest">
        Eye Prescription
      </p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <RxBlock side="right" data={slip} />
        <RxBlock side="left" data={slip} />
      </div>
      {slip.notes && (
        <p className="mt-1 text-[10px] leading-snug">{slip.notes}</p>
      )}

      <div className="my-2 border-t border-dashed border-gray-400" />

      <div className="ml-auto w-48 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Price:</span>
          <span>{formatCurrency(slip.price, slip.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Advance Payment:</span>
          <span>{formatCurrency(slip.advance, slip.currency)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-black pt-0.5 text-sm font-black">
          <span>Remaining:</span>
          <span>{formatCurrency(slip.remaining, slip.currency)}</span>
        </div>
      </div>

      <div className="my-3 border-t-2 border-black" />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-end gap-2 px-1 pb-0.5 text-center text-[10px]">
          <div className="border-t border-black pt-0.5">Customer Signature</div>
        </div>
        <div className="flex flex-col justify-end gap-2 px-1 pb-0.5 text-center text-[10px]">
          <div className="border-t border-black pt-0.5">Official Stamp</div>
        </div>
      </div>

      <div className="mt-4 text-center text-[9px] leading-relaxed text-gray-700">
        <p>
          Note: Testing slip must be returned at the time of collection. Article
          not collected within <b>30 days</b> shall be considered unclaimed.
        </p>
      </div>
    </div>
  );
}