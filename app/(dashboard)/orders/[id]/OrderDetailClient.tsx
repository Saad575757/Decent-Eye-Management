"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { AddPaymentDialog } from "@/components/payments/AddPaymentDialog";
import { deleteOrderAction } from "@/lib/actions";

interface Props {
  orderId: string;
  orderNumber: string;
  total: number;
  paid: number;
  balance: number;
  currency: string;
  currentStatus: string;
}

export default function OrderDetailClient({
  orderId,
  orderNumber,
  total,
  paid,
  balance,
  currency,
  currentStatus,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const res = await deleteOrderAction(orderId);
    if (res.ok) {
      router.push("/orders");
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} disabled={balance <= 0}>
        <CreditCard className="h-4 w-4" />
        Add Payment
      </Button>
      <Button
        variant="destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete
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
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Order"
        description={`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
