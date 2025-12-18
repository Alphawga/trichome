"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ReviewStatus } from "@prisma/client";
import { useEffect, useState } from "react";
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
import { LogoLoader } from "@/components/ui/logo-loader";
import { trpc } from "@/utils/trpc";

const reviewModerationSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
});

type ReviewModerationInput = z.infer<typeof reviewModerationSchema>;

interface ReviewModerationSheetProps {
  reviewId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReviewModerationSheet({
  reviewId,
  open,
  onOpenChange,
  onSuccess,
}: ReviewModerationSheetProps) {
  const [review, setReview] = useState<{
    id: string;
    product: { name: string };
    user: { email: string };
    rating: number;
    title: string | null;
    comment: string | null;
    status: ReviewStatus;
  } | null>(null);

  const reviewsQuery = trpc.getAllReviews.useQuery(
    {
      page: 1,
      limit: 1000,
    },
    {
      enabled: !!reviewId && open,
      onSuccess: (data) => {
        const foundReview = data.reviews.find((r) => r.id === reviewId);
        if (foundReview) {
          setReview(foundReview);
        }
      },
    },
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewModerationInput>({
    resolver: zodResolver(reviewModerationSchema),
    defaultValues: {
      status: ReviewStatus.PENDING,
    },
  });

  const updateStatusMutation = trpc.updateReviewStatus.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      toast.success("Review status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update review: ${error.message}`);
    },
  });

  // Load review data
  useEffect(() => {
    if (review) {
      reset({
        status: review.status,
      });
    }
  }, [review, reset]);

  const onSubmit = async (data: ReviewModerationInput) => {
    if (!reviewId) return;

    await updateStatusMutation.mutateAsync({
      id: reviewId,
      status: data.status,
    });
  };

  const selectedStatus = watch("status");

  if (!reviewId) return null;

  if (reviewsQuery.isLoading || !review) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg px-4 md:px-6">
          <div className="flex items-center justify-center py-12">
            <LogoLoader size="md" text="Loading review..." />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xl ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg px-4 md:px-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Moderate Review</SheetTitle>
          <SheetDescription>
            Approve or reject this product review
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Review Preview */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="mb-3">
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-medium">{review.product.name}</p>
            </div>
            <div className="mb-3">
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{review.user.email}</p>
            </div>
            <div className="mb-3">
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600">
                  {review.rating}/5
                </span>
              </div>
            </div>
            {review.title && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{review.title}</p>
              </div>
            )}
            {review.comment && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Comment</p>
                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                  {review.comment}
                </p>
              </div>
            )}
          </div>

          {/* Current Status */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Current Status</p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${review.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : review.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
                }`}
            >
              {review.status === "APPROVED"
                ? "Approved"
                : review.status === "PENDING"
                  ? "Pending"
                  : "Rejected"}
            </span>
          </div>

          {/* Status Selection */}
          <div>
            <label htmlFor="status" className="text-gray-700">
              New Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value={ReviewStatus.PENDING}>Pending</option>
              <option value={ReviewStatus.APPROVED}>Approve</option>
              <option value={ReviewStatus.REJECTED}>Reject</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500 mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Status Change Info */}
          {selectedStatus !== review.status && (
            <div
              className={`p-3 rounded-lg ${selectedStatus === "APPROVED"
                ? "bg-green-50 border border-green-200"
                : selectedStatus === "REJECTED"
                  ? "bg-red-50 border border-red-200"
                  : "bg-yellow-50 border border-yellow-200"
                }`}
            >
              <p
                className={`text-sm ${selectedStatus === "APPROVED"
                  ? "text-green-800"
                  : selectedStatus === "REJECTED"
                    ? "text-red-800"
                    : "text-yellow-800"
                  }`}
              >
                {selectedStatus === "APPROVED" && (
                  <>✓ This review will be visible to customers.</>
                )}
                {selectedStatus === "REJECTED" && (
                  <>✗ This review will be hidden from customers.</>
                )}
                {selectedStatus === "PENDING" && (
                  <>⏳ This review will be pending moderation.</>
                )}
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
              disabled={isSubmitting || selectedStatus === review.status}
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

