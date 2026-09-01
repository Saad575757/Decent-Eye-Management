"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatusAction } from "@/lib/actions";

const STATUSES = ["PENDING", "PROCESSING", "READY", "DELIVERED", "CANCELLED"];

export function ChangeStatus({ orderId, current }: { orderId: string; current: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChange(value: string) {
    setStatus(value);
    setLoading(true);
    setMessage("");
    const res = await updateOrderStatusAction(orderId, value);
    setLoading(false);
    if (res.ok) {
      setMessage("Status updated.");
      router.refresh();
    } else {
      setStatus(current);
      setMessage(res.error || "Something went wrong");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleChange} disabled={loading}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {message && !loading && (
        <span className="text-xs text-green-600">{message}</span>
      )}
    </div>
  );
}
