"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog";

interface Props {
  orderId: string;
  total: number;
  paid: number;
  balance: number;
  currency: string;
  currentStatus: string;
}

export default function OrderDetailClient({
  orderId,
  total,
  paid,
  balance,
  currency,
  currentStatus,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} disabled={balance <= 0}>
        <CreditCard className="h-4 w-4" />
        Add Payment
      </Button>
      <AddPaymentDialog
        open={open}
        onOpenChange={setOpen}
        orderId={orderId}
        total={total}
        paid={paid}
        balance={balance}
        currency={currency}
      />
    </>
  );
}
