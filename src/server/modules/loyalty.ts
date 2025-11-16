import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

// Get user loyalty points
export const getMyLoyaltyPoints = protectedProcedure.query(async ({ ctx }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: {
      loyalty_points: true,
      loyalty_tier: true,
    },
  });

  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  // Calculate tier based on points
  const tier = calculateTier(user.loyalty_points || 0);

  return {
    points: user.loyalty_points || 0,
    tier: user.loyalty_tier || tier,
    nextTier: getNextTier(tier),
    pointsToNextTier: getPointsToNextTier(user.loyalty_points || 0, tier),
  };
});

// Get loyalty tier benefits
export const getLoyaltyTiers = publicProcedure.query(async () => {
  return [
    {
      tier: "BRONZE",
      name: "Bronze",
      minPoints: 0,
      benefits: ["5% off on all orders", "Early access to sales"],
    },
    {
      tier: "SILVER",
      name: "Silver",
      minPoints: 500,
      benefits: ["10% off on all orders", "Free shipping", "Birthday discount"],
    },
    {
      tier: "GOLD",
      name: "Gold",
      minPoints: 1500,
      benefits: [
        "15% off on all orders",
        "Free shipping",
        "Priority support",
        "Exclusive products",
      ],
    },
    {
      tier: "PLATINUM",
      name: "Platinum",
      minPoints: 5000,
      benefits: [
        "20% off on all orders",
        "Free express shipping",
        "VIP support",
        "Exclusive events",
        "Personal shopper",
      ],
    },
  ];
});

// Add loyalty points (internal use - called after order completion)
export const addLoyaltyPoints = protectedProcedure
  .input(
    z.object({
      points: z.number().int().positive(),
      reason: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const newPoints = (user.loyalty_points || 0) + input.points;
    const newTier = calculateTier(newPoints);

    const updatedUser = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        loyalty_points: newPoints,
        loyalty_tier: newTier,
      },
    });

    return {
      points: updatedUser.loyalty_points || 0,
      tier: updatedUser.loyalty_tier || newTier,
      addedPoints: input.points,
    };
  });

// Calculate tier based on points
function calculateTier(points: number): string {
  if (points >= 5000) return "PLATINUM";
  if (points >= 1500) return "GOLD";
  if (points >= 500) return "SILVER";
  return "BRONZE";
}

// Get next tier
function getNextTier(
  currentTier: string,
): { tier: string; name: string; minPoints: number } | null {
  const tiers = [
    { tier: "BRONZE", name: "Bronze", minPoints: 0 },
    { tier: "SILVER", name: "Silver", minPoints: 500 },
    { tier: "GOLD", name: "Gold", minPoints: 1500 },
    { tier: "PLATINUM", name: "Platinum", minPoints: 5000 },
  ];

  const currentIndex = tiers.findIndex((t) => t.tier === currentTier);
  if (currentIndex === -1 || currentIndex === tiers.length - 1) return null;

  return tiers[currentIndex + 1];
}

// Get points needed for next tier
function getPointsToNextTier(
  currentPoints: number,
  currentTier: string,
): number {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return 0;

  return Math.max(0, nextTier.minPoints - currentPoints);
}
