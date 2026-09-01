import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "PKR") {
  return `${currency} ${amount.toLocaleString("en-PK")}`;
}

export function formatDate(date: Date | string, pattern = "dd MMM yyyy") {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern);
}

export function getStatusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy, h:mm a");
}
