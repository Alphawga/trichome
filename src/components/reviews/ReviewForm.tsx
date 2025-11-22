"use client";

import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

interface ReviewFormProps {
  /** Product ID */
  productId: string;
  /** Callback when review is submitted */
  onReviewSubmitted?: () => void;
  /** Show form in modal */
  showAsModal?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * ReviewForm Component
 *
 * Reusable component for submitting product reviews.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable across different contexts
 * - Type-safe
 * - Proper validation
 * - Loading states
 */
export function ReviewForm({
  productId,
  onReviewSubmitted,
  showAsModal = false,
  className = "",
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const createReviewMutation = trpc.createReview.useMutation({
    onSuccess: () => {
      toast.success(
        "Review submitted successfully! It will be reviewed before being published.",
      );
      setRating(0);
      setTitle("");
      setComment("");
      onReviewSubmitted?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    createReviewMutation.mutate({
      product_id: productId,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label
          htmlFor="review-rating"
          className="block text-sm font-medium text-trichomes-forest mb-2 font-body"
        >
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform duration-150 hover:scale-110"
            >
              <svg
                aria-labelledby="review-rating"
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "text-trichomes-gold fill-current"
                    : "text-trichomes-forest/20"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <title>Rating star</title>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-trichomes-forest/60 font-body ml-2">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="review-title"
          className="block text-sm font-medium text-trichomes-forest mb-2 font-body"
        >
          Review Title (Optional)
        </label>
        <input
          type="text"
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="w-full px-4 py-3 border border-trichomes-forest/15 bg-trichomes-soft focus:ring-1 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none font-body"
        />
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-trichomes-forest mb-2 font-body"
        >
          Your Review (Optional)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={5}
          maxLength={1000}
          className="w-full px-4 py-3 border border-trichomes-forest/15 bg-trichomes-soft focus:ring-1 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none resize-none font-body"
        />
        <p className="text-xs text-trichomes-forest/60 mt-1 font-body">
          {comment.length}/1000 characters
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={createReviewMutation.isPending || rating === 0}
          className="px-6 py-3 bg-trichomes-primary text-white hover:bg-trichomes-primary/90 rounded font-medium text-sm font-body transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
        </button>
        {showAsModal && (
          <button
            type="button"
            onClick={() => {
              setRating(0);
              setTitle("");
              setComment("");
              onReviewSubmitted?.();
            }}
            className="px-6 py-3 border border-trichomes-forest/20 text-trichomes-forest hover:bg-trichomes-soft rounded font-medium text-sm font-body transition-colors duration-150"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
