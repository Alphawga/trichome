"use client";

import { format } from "date-fns";

interface ReviewCardProps {
  /** Review data */
  review: {
    id: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    helpful_count: number;
    created_at: Date;
    user: {
      first_name: string;
      last_name: string;
      email?: string;
    };
  };
  /** Show helpful button */
  showHelpful?: boolean;
  /** Callback when helpful is clicked */
  onHelpful?: (reviewId: string) => void;
  /** Show user email */
  showEmail?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * ReviewCard Component
 *
 * Reusable component for displaying product reviews.
 * Used in product detail pages and review listings.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable across different contexts
 * - Type-safe
 * - Consistent styling
 * - Accessible
 */
export function ReviewCard({
  review,
  showHelpful = true,
  onHelpful,
  showEmail = false,
  className = "",
}: ReviewCardProps) {
  const userInitials =
    `${review.user.first_name[0]}${review.user.last_name[0]}`.toUpperCase();
  const userName = `${review.user.first_name} ${review.user.last_name}`;

  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-trichomes-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-trichomes-primary font-body">
            {userInitials}
          </span>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-medium text-trichomes-forest font-body">
                {userName}
              </div>
              {showEmail && review.user.email && (
                <div className="text-xs text-trichomes-forest/60 font-body">
                  {review.user.email}
                </div>
              )}
            </div>
            <div className="text-xs text-trichomes-forest/60 font-body">
              {format(new Date(review.created_at), "MMM dd, yyyy")}
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
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

          {/* Review Title */}
          {review.title && (
            <h4 className="font-semibold text-trichomes-forest mb-2 font-body">
              {review.title}
            </h4>
          )}

          {/* Review Comment */}
          {review.comment && (
            <p className="text-sm text-trichomes-forest/70 leading-relaxed mb-3 font-body whitespace-pre-wrap">
              {review.comment}
            </p>
          )}

          {/* Helpful Button */}
          {showHelpful && (
            <div className="flex items-center gap-4 pt-3 border-t border-trichomes-forest/10">
              <button
                type="button"
                onClick={() => onHelpful?.(review.id)}
                className="text-xs text-trichomes-forest/60 hover:text-trichomes-primary font-body transition-colors duration-150 flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Helpful</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                Helpful ({review.helpful_count})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
