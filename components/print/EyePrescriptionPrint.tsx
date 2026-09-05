import { format } from "date-fns";
import type { PrescriptionPrintData } from "@/components/print/PrescriptionPrint";

export interface EyePrescriptionPrintData {
  shopName: string;
  customerName: string;
  customerPhone: string;
  orderDate: Date;
  prescriptions: PrescriptionPrintData[];
}

function EyeBlock({
  data,
  side,
}: {
  data: PrescriptionPrintData;
  side: "right" | "left";
}) {
  const s = data[`${side}Sphere`];
  const c = data[`${side}Cylinder`];
  const a = data[`${side}Axis`];
  const add = data[`${side}Add`];
  const pd = data[`${side}PD`];

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

export function EyePrescriptionPrint({
  data,
}: {
  data: EyePrescriptionPrintData;
}) {
  return (
    <div className="mx-auto w-[72mm] bg-white px-3 py-5 text-black">
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decent-eye-logo.png"
          alt={data.shopName}
          className="h-24 w-auto object-contain"
        />
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide">
          Eye Prescription
        </p>
      </div>

      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Customer:</span>
          <span className="font-semibold">{data.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span>Phone:</span>
          <span>{data.customerPhone}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{format(new Date(data.orderDate), "dd MMM yyyy")}</span>
        </div>
      </div>

      <div className="my-3 border-b border-dashed border-gray-400" />

      {data.prescriptions.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No prescription recorded for this order.
        </p>
      ) : (
        <div className="space-y-4">
          {data.prescriptions.map((rx, idx) => (
            <div key={idx}>
              {rx.customerName && (
                <p className="mb-1 text-xs font-semibold uppercase">
                  {rx.customerName}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <EyeBlock data={rx} side="right" />
                <EyeBlock data={rx} side="left" />
              </div>
              {rx.notes && (
                <p className="mt-1 text-xs leading-snug">{rx.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="text-center text-[10px] leading-relaxed">
        <p>Shop No. 8, Farhan Tower, Block-10/A,</p>
        <p>Near Toyota Showroom Gulshan-e-Iqbal, Karachi.</p>
        <p>Cell: 0308-2246251, 0337-3161788</p>
      </div>
    </div>
  );
}