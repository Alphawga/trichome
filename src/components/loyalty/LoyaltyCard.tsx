"use client";

import { trpc } from "@/utils/trpc";

interface LoyaltyCardProps {
  /** Show full card or compact view */
  variant?: "full" | "compact";
  /** Additional className */
  className?: string;
}

/**
 * LoyaltyCard Component
 *
 * Displays user's loyalty points, tier, and benefits.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Loading states
 * - Error handling
 */
export function LoyaltyCard({
  variant = "full",
  className = "",
}: LoyaltyCardProps) {
  const { data: loyaltyData, isLoading } = trpc.getMyLoyaltyPoints.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    },
  );

  const { data: tiers } = trpc.getLoyaltyTiers.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div
        className={`bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm ${className}`}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-trichomes-soft rounded w-1/3"></div>
          <div className="h-4 bg-trichomes-soft rounded w-2/3"></div>
          <div className="h-32 bg-trichomes-soft rounded"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  const currentTierInfo = tiers?.find((t) => t.tier === loyaltyData.tier);
  const nextTierInfo = loyaltyData.nextTier;

  if (variant === "compact") {
    return (
      <div
        className={`bg-gradient-to-r from-trichomes-gold/10 to-trichomes-primary/10 p-4 rounded-xl border border-trichomes-forest/10 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-trichomes-forest/60 font-body">
              Loyalty Points
            </p>
            <p className="text-2xl font-bold text-trichomes-forest font-heading">
              {loyaltyData.points}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-trichomes-forest/60 font-body uppercase">
              {loyaltyData.tier}
            </p>
            {nextTierInfo && (
              <p className="text-xs text-trichomes-primary font-body">
                {loyaltyData.pointsToNextTier} to {nextTierInfo.name}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-trichomes-forest">
          Loyalty Program
        </h3>
        <span className="px-3 py-1 bg-trichomes-gold/20 text-trichomes-forest rounded-full text-xs font-semibold uppercase font-body">
          {loyaltyData.tier}
        </span>
      </div>

      {/* Points Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-trichomes-forest font-heading">
            {loyaltyData.points}
          </span>
          <span className="text-sm text-trichomes-forest/60 font-body">
            points
          </span>
        </div>
        {nextTierInfo && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-trichomes-forest/60 font-body">
                Progress to {nextTierInfo.name}
              </span>
              <span className="text-xs text-trichomes-forest/60 font-body">
                {loyaltyData.pointsToNextTier} points needed
              </span>
            </div>
            <div className="w-full bg-trichomes-forest/10 rounded-full h-2">
              <div
                className="bg-trichomes-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (loyaltyData.points / nextTierInfo.minPoints) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Current Tier Benefits */}
      {currentTierInfo && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-trichomes-forest mb-2 font-body">
            Your Benefits
          </h4>
          <ul className="space-y-1">
            {currentTierInfo.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm text-trichomes-forest/70 font-body"
              >
                <svg
                  className="w-4 h-4 text-trichomes-primary mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Benefit</title>
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Tiers */}
      {tiers && (
        <div>
          <h4 className="text-sm font-semibold text-trichomes-forest mb-3 font-body">
            All Tiers
          </h4>
          <div className="space-y-2">
            {tiers.map((tier) => {
              const isCurrentTier = tier.tier === loyaltyData.tier;
              const isUnlocked = (loyaltyData.points || 0) >= tier.minPoints;

              return (
                <div
                  key={tier.tier}
                  className={`p-3 rounded-lg border-2 transition-all duration-150 ${
                    isCurrentTier
                      ? "border-trichomes-primary bg-trichomes-primary/5"
                      : isUnlocked
                        ? "border-trichomes-forest/20 bg-trichomes-soft"
                        : "border-trichomes-forest/10 bg-trichomes-soft/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-trichomes-forest font-body">
                      {tier.name}
                    </span>
                    <span className="text-xs text-trichomes-forest/60 font-body">
                      {tier.minPoints} points
                    </span>
                  </div>
                  {isCurrentTier && (
                    <span className="text-xs text-trichomes-primary font-body">
                      Current Tier
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
