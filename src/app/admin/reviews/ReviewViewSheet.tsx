"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogoLoader } from "@/components/ui/logo-loader";
import { trpc } from "@/utils/trpc";

interface ReviewViewSheetProps {
  reviewId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewViewSheet({
  reviewId,
  open,
  onOpenChange,
}: ReviewViewSheetProps) {
  // We need to get the review from the list since there's no getReviewById for admin
  // For now, we'll use getAllReviews with a filter
  const reviewsQuery = trpc.getAllReviews.useQuery(
    {
      page: 1,
      limit: 1000,
    },
    {
      enabled: !!reviewId && open,
    },
  );

  const review = reviewsQuery.data?.reviews.find((r) => r.id === reviewId);

  if (!reviewId) return null;

  if (reviewsQuery.isLoading) {
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

  if (!review) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg px-4 md:px-6">
          <div className="text-center py-8 text-gray-500">
            Review not found
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg px-4 md:px-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Review Details</SheetTitle>
          <SheetDescription>View complete review information</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Product Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <Link
              href={`/products/${review.product.id}`}
              className="text-[#40702A] hover:text-[#1E3024] hover:underline font-medium"
            >
              {review.product.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              Product ID: {review.product.id}
            </p>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer</h3>
            <div className="space-y-2">
              <p className="font-medium">
                {review.user.first_name || review.user.last_name
                  ? `${review.user.first_name || ""} ${review.user.last_name || ""}`.trim()
                  : "No name"}
              </p>
              <p className="text-sm text-gray-500">{review.user.email}</p>
              <p className="text-sm text-gray-500">User ID: {review.user.id}</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Rating</h3>
            <div className="flex items-center gap-2">
              {renderStars(review.rating)}
              <span className="ml-2 font-medium text-gray-900">
                {review.rating} out of 5
              </span>
            </div>
          </div>

          {/* Review Content */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Review Content</h3>
            {review.title && (
              <div className="mb-3">
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium text-gray-900">{review.title}</p>
              </div>
            )}
            {review.comment ? (
              <div>
                <p className="text-sm text-gray-500 mb-2">Comment</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {review.comment}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 italic">No comment provided</p>
            )}
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Status</h3>
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

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Helpful Count</p>
                <p className="font-medium">{review.helpful_count}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dates</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {new Date(review.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

