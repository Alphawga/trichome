"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

interface PaymentRefundSheetProps {
  paymentId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PaymentRefundSheet({
  paymentId,
  open,
  onOpenChange,
  onSuccess,
}: PaymentRefundSheetProps) {
  const [refundAmount, setRefundAmount] = useState("");
  const [reason, setReason] = useState("");

  const paymentQuery = trpc.getPaymentById.useQuery(
    { id: paymentId! },
    {
      enabled: !!paymentId && open,
      onSuccess: (data) => {
        setRefundAmount(Number(data.amount).toString());
      },
    },
  );

  const refundMutation = trpc.processRefund.useMutation({
    onSuccess: () => {
      toast.success("Refund processed successfully");
      onOpenChange(false);
      setRefundAmount("");
      setReason("");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to process refund: ${error.message}`);
    },
  });

  const payment = paymentQuery.data;
  const maxRefund = payment ? Number(payment.amount) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentId) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (amount > maxRefund) {
      toast.error(`Refund amount cannot exceed ₦${maxRefund.toLocaleString()}`);
      return;
    }

    await refundMutation.mutateAsync({
      paymentId,
      amount: amount < maxRefund ? amount : undefined,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Process Refund</SheetTitle>
        </SheetHeader>

        {paymentQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : paymentQuery.error ? (
          <div className="text-center py-12 text-red-600">
            Error loading payment details
          </div>
        ) : payment ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Payment Amount</p>
                  <p className="font-medium text-gray-900">
                    ₦{Number(payment.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium text-gray-900">
                    {payment.transaction_id || payment.reference || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount (₦)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefund}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Enter refund amount"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₦{maxRefund.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                placeholder="Enter refund reason..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setRefundAmount("");
                  setReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refundMutation.isPending}
                className="flex-1 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-[#1E3024] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refundMutation.isPending ? "Processing..." : "Process Refund"}
              </button>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

