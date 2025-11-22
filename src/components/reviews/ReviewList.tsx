"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";

interface ReviewListProps {
  /** Product ID */
  productId: string;
  /** Show review form */
  showForm?: boolean;
  /** User ID (for checking if user can review) */
  userId?: string;
  /** Additional className */
  className?: string;
}

/**
 * ReviewList Component
 *
 * Displays product reviews with pagination and review submission form.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Proper loading states
 * - Error handling
 */
export function ReviewList({
  productId,
  showForm = true,
  userId,
  className = "",
}: ReviewListProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = trpc.getProductReviews.useQuery(
    {
      productId,
      page,
      limit,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const markHelpfulMutation = trpc.markReviewHelpful.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleHelpful = (reviewId: string) => {
    markHelpfulMutation.mutate({ id: reviewId });
  };

  const handleReviewSubmitted = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-trichomes-soft rounded-xl border border-trichomes-forest/15"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { reviews, pagination, stats } = data;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Review Stats */}
      <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-trichomes-forest">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.averageRating)
                      ? "text-trichomes-gold fill-current"
                      : "text-trichomes-forest/20"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Rating star</title>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-trichomes-forest font-body">
              {stats.averageRating.toFixed(1)} ({stats.totalReviews}{" "}
              {stats.totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && userId && (
        <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
          <h4 className="text-base font-heading font-semibold text-trichomes-forest mb-4">
            Write a Review
          </h4>
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm text-center">
          <p className="text-trichomes-forest/60 font-body">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={handleHelpful}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-trichomes-forest/20 text-trichomes-forest hover:bg-trichomes-soft rounded font-medium text-sm font-body transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-trichomes-forest/60 font-body">
            Page {page} of {pagination.pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-trichomes-forest/20 text-trichomes-forest hover:bg-trichomes-soft rounded font-medium text-sm font-body transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
