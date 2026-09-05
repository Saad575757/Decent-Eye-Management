export interface PrescriptionPrintData {
  customerName?: string | null;
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
}

function line(rx: PrescriptionPrintData, side: "right" | "left") {
  const p = rx[`${side}Sphere`];
  const c = rx[`${side}Cylinder`];
  const a = rx[`${side}Axis`];
  const add = rx[`${side}Add`];
  const pd = rx[`${side}PD`];

  return (
    <p className="leading-snug">
      <span className="font-semibold uppercase">
        {side === "right" ? "Right" : "Left"} Eye:
      </span>{" "}
      SPH: {p || "—"} &nbsp;CYL: {c || "—"} &nbsp;AXIS: {a || "—"} &nbsp;ADD:{" "}
      {add || "—"} &nbsp;PD: {pd || "—"}
    </p>
  );
}

export function PrescriptionPrint({
  prescriptions,
}: {
  prescriptions: PrescriptionPrintData[];
}) {
  if (prescriptions.length === 0) return null;

  return (
    <div className="mt-3 text-xs">
      {prescriptions.map((rx, idx) => (
        <div key={idx}>
          {idx > 0 && <div className="my-2 border-b border-gray-300" />}
          <p className="font-semibold uppercase tracking-wide">
            Eye Prescription
            {rx.customerName ? ` — ${rx.customerName}` : ""}
          </p>
          <div className="mt-1 space-y-0.5">
            {line(rx, "right")}
            {line(rx, "left")}
          </div>
          {rx.notes && (
            <p className="mt-1 leading-snug text-black">{rx.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}