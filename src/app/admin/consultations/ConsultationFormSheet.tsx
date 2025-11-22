"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ConsultationStatus } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

const consultationStatusSchema = z.object({
  status: z.nativeEnum(ConsultationStatus),
  cancellation_reason: z.string().optional(),
});

type ConsultationStatusInput = z.infer<typeof consultationStatusSchema>;

interface ConsultationFormSheetProps {
  consultationId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConsultationFormSheet({
  consultationId,
  open,
  onOpenChange,
  onSuccess,
}: ConsultationFormSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationStatusInput>({
    resolver: zodResolver(consultationStatusSchema),
    defaultValues: {
      status: ConsultationStatus.PENDING,
      cancellation_reason: "",
    },
  });

  const consultationQuery = trpc.getConsultationByIdAdmin.useQuery(
    consultationId ? { id: consultationId } : { id: "" },
    { enabled: !!consultationId && open },
  );

  const updateStatusMutation = trpc.updateConsultationStatus.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      toast.success("Consultation status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Load consultation data
  useEffect(() => {
    if (consultationQuery.data && consultationId) {
      reset({
        status: consultationQuery.data.status,
        cancellation_reason: consultationQuery.data.cancellation_reason || "",
      });
    } else if (!consultationId) {
      reset({
        status: ConsultationStatus.PENDING,
        cancellation_reason: "",
      });
    }
  }, [consultationQuery.data, consultationId, reset]);

  const onSubmit = async (data: ConsultationStatusInput) => {
    if (!consultationId) return;

    await updateStatusMutation.mutateAsync({
      id: consultationId,
      status: data.status,
      cancellation_reason:
        data.status === "CANCELLED" ? data.cancellation_reason : undefined,
    });
  };

  const selectedStatus = watch("status");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Update Consultation Status</SheetTitle>
          <SheetDescription>
            Change the status of this consultation booking
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Current Consultation Info */}
          {consultationQuery.data && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">
                {consultationQuery.data.first_name}{" "}
                {consultationQuery.data.last_name}
              </p>
              <p className="text-sm text-gray-500 mt-2">Type</p>
              <p className="font-medium">{consultationQuery.data.type}</p>
              <p className="text-sm text-gray-500 mt-2">Date</p>
              <p className="font-medium">
                {new Date(
                  consultationQuery.data.preferred_date,
                ).toLocaleDateString()}{" "}
                at {consultationQuery.data.preferred_time}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <label htmlFor="status" className="text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value={ConsultationStatus.PENDING}>Pending</option>
              <option value={ConsultationStatus.CONFIRMED}>Confirmed</option>
              <option value={ConsultationStatus.COMPLETED}>Completed</option>
              <option value={ConsultationStatus.CANCELLED}>Cancelled</option>
              <option value={ConsultationStatus.NO_SHOW}>No Show</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500 mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Cancellation Reason */}
          {selectedStatus === "CANCELLED" && (
            <div>
              <label htmlFor="cancellation_reason" className="text-gray-700">
                Cancellation Reason
              </label>
              <textarea
                id="cancellation_reason"
                {...register("cancellation_reason")}
                rows={4}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="Enter reason for cancellation..."
              />
              {errors.cancellation_reason && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.cancellation_reason.message}
                </p>
              )}
            </div>
          )}

          {/* Warning for destructive actions */}
          {selectedStatus === "CANCELLED" &&
            consultationQuery.data?.status !== "CANCELLED" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ⚠️ This will cancel the consultation. The customer will be
                  notified.
                </p>
              </div>
            )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

