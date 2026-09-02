import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  ADVANCED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[normalized] ||
          "bg-secondary text-secondary-foreground border-transparent"
      )}
    >
      {getStatusLabel(normalized)}
    </span>
  );
}
