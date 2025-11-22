"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { ChevronRightIcon } from "@/components/ui/icons";

interface RewardTier {
  name: string;
  minPoints: number;
  color: string;
  benefits: string[];
}

const rewardTiers: RewardTier[] = [
  {
    name: "Bronze",
    minPoints: 0,
    color: "text-orange-700",
    benefits: [
      "Earn 1 point per ₦100 spent",
      "Birthday surprise gift",
      "Early access to sales",
    ],
  },
  {
    name: "Silver",
    minPoints: 500,
    color: "text-gray-500",
    benefits: [
      "Earn 1.5 points per ₦100 spent",
      "Free shipping on orders over ₦10,000",
      "Exclusive Silver member events",
      "Priority customer support",
    ],
  },
  {
    name: "Gold",
    minPoints: 1000,
    color: "text-yellow-600",
    benefits: [
      "Earn 2 points per ₦100 spent",
      "Free shipping on all orders",
      "20% off birthday month",
      "VIP access to new products",
      "Complimentary gift wrapping",
    ],
  },
];

const earnPointsWays = [
  {
    title: "Make a Purchase",
    description: "Earn points on every order you place",
    icon: "🛍️",
    points: "1-2 pts per ₦100",
  },
  {
    title: "Write a Review",
    description: "Share your product experience",
    icon: "✍️",
    points: "50 points",
  },
  {
    title: "Refer a Friend",
    description: "Give ₦5,000, Get ₦5,000 in points",
    icon: "👥",
    points: "500 points",
  },
  {
    title: "Birthday Bonus",
    description: "Celebrate your special day with us",
    icon: "🎂",
    points: "100 points",
  },
  {
    title: "Social Media Follow",
    description: "Follow us on Instagram & TikTok",
    icon: "📱",
    points: "25 points",
  },
  {
    title: "Newsletter Signup",
    description: "Stay updated with our latest offers",
    icon: "📧",
    points: "50 points",
  },
];

const redeemOptions = [
  {
    title: "₦500 Off",
    points: 100,
    description: "On orders over ₦5,000",
  },
  {
    title: "₦1,000 Off",
    points: 200,
    description: "On orders over ₦10,000",
  },
  {
    title: "₦2,500 Off",
    points: 500,
    description: "On orders over ₦20,000",
  },
  {
    title: "₦5,000 Off",
    points: 1000,
    description: "On orders over ₦40,000",
  },
  {
    title: "Free Product",
    points: 750,
    description: "Choose from select items",
  },
  {
    title: "Free Consultation",
    points: 300,
    description: "One-on-one with our experts",
  },
];

export default function RewardsPage() {
  const { session, isAuthenticated } = useAuth();
  const [userPoints, setUserPoints] = useState(0);
  const [currentTier, setCurrentTier] = useState<RewardTier>(rewardTiers[0]);
  const [nextTier, setNextTier] = useState<RewardTier | null>(rewardTiers[1]);

  useEffect(() => {
    // Mock user points - replace with actual API call
    if (isAuthenticated) {
      setUserPoints(350); // Example points
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Determine current tier based on points
    const tier = [...rewardTiers]
      .reverse()
      .find((t) => userPoints >= t.minPoints);
    if (tier) {
      setCurrentTier(tier);
      const tierIndex = rewardTiers.indexOf(tier);
      setNextTier(
        tierIndex < rewardTiers.length - 1 ? rewardTiers[tierIndex + 1] : null,
      );
    }
  }, [userPoints]);

  const progressToNextTier = nextTier
    ? ((userPoints - currentTier.minPoints) /
        (nextTier.minPoints - currentTier.minPoints)) *
      100
    : 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] animate-[sectionEntrance_600ms_ease-out]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/banners/product-banner.jpg')" }}
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(64, 112, 41, 0.9), rgba(64, 112, 41, 0.7), transparent)",
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <div className="flex flex-col items-start max-w-2xl">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
              Rewards Program
            </h1>

            {/* Breadcrumbs */}
            <nav
              className="flex items-center space-x-2 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              <Link
                href="/"
                className="text-[14px] text-white/80 hover:text-white transition-colors duration-150 ease-out font-body"
              >
                Home
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-white/60" />
              <span className="text-[14px] text-white font-body">
                Rewards
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 max-w-[1440px] animate-[sectionEntrance_600ms_ease-out]">
        {/* User Points Dashboard - Only show if authenticated */}
        {isAuthenticated && (
          <div className="mb-12 bg-gradient-to-br from-[#1E3024] to-[#40702A] rounded-sm p-6 sm:p-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-white/80 text-[14px] mb-1 font-body">
                  Welcome back, {session?.user.first_name || "Member"}!
                </p>
                <h2 className="text-[32px] sm:text-[40px] font-heading mb-2">
                  {userPoints.toLocaleString()} Points
                </h2>
                <p className="text-white/90 text-[15px] font-body">
                  Current Tier:{" "}
                  <span className="font-medium">{currentTier.name}</span>
                </p>
              </div>

              <div className="flex-1 max-w-md">
                {nextTier ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[13px] text-white/80 font-body">
                        Progress to {nextTier.name}
                      </p>
                      <p className="text-[13px] text-white/80 font-body font-medium">
                        {nextTier.minPoints - userPoints} points to go
                      </p>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[15px] text-white/90 font-body font-medium">
                      🎉 You've reached the highest tier!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Introduction */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-[28px] sm:text-[36px] lg:text-[40px] font-heading mb-4 text-gray-900">
            Earn Rewards While You Shop
          </h2>
          <p className="text-[15px] sm:text-[16px] text-gray-600 leading-relaxed font-body">
            Join our loyalty program and earn points with every purchase. Redeem
            your points for exclusive discounts, free products, and special
            perks. The more you shop, the more you save!
          </p>
          {!isAuthenticated && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-[#1E3024] text-white px-6 py-3 rounded-full hover:bg-[#1E3024]/90 font-medium transition-all duration-150 ease-out hover:shadow-md text-[14px] sm:text-[15px] font-body inline-block"
              >
                Join Now - It's Free!
              </Link>
              <Link
                href="/auth/signin"
                className="border-2 border-[#1E3024] text-[#1E3024] px-6 py-3 rounded-full hover:bg-[#1E3024] hover:text-white font-medium transition-all duration-150 ease-out text-[14px] sm:text-[15px] font-body inline-block"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Reward Tiers */}
        <div className="mb-16">
          <h3 className="text-[24px] sm:text-[28px] font-heading mb-8 text-gray-900 text-center">
            Membership Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewardTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`bg-white rounded-sm border-2 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
                  isAuthenticated && tier.name === currentTier.name
                    ? "border-[#40702A] ring-2 ring-[#40702A]/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className={`text-[20px] sm:text-[24px] font-heading ${tier.color}`}
                  >
                    {tier.name}
                  </h4>
                  {isAuthenticated && tier.name === currentTier.name && (
                    <span className="bg-[#40702A] text-white text-[11px] px-3 py-1 rounded-full font-body font-medium">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-gray-600 mb-4 font-body">
                  {tier.minPoints === 0
                    ? "Starting tier"
                    : `${tier.minPoints}+ points`}
                </p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-start text-[13px] sm:text-[14px] text-gray-700 font-body"
                    >
                      <svg
                        className="w-5 h-5 text-[#40702A] mr-2 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="mb-16">
          <h3 className="text-[24px] sm:text-[28px] font-heading mb-8 text-gray-900 text-center">
            Ways to Earn Points
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnPointsWays.map((way, index) => (
              <div
                key={index}
                className="bg-white rounded-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-4xl mb-4">{way.icon}</div>
                <h4 className="text-[16px] sm:text-[18px] font-heading mb-2 text-gray-900">
                  {way.title}
                </h4>
                <p className="text-[13px] sm:text-[14px] text-gray-600 mb-3 font-body">
                  {way.description}
                </p>
                <p className="text-[14px] font-medium text-[#40702A] font-body">
                  {way.points}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem Your Points */}
        <div className="mb-16">
          <h3 className="text-[24px] sm:text-[28px] font-heading mb-8 text-gray-900 text-center">
            Redeem Your Points
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {redeemOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white rounded-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-[18px] sm:text-[20px] font-heading text-gray-900 group-hover:text-[#40702A] transition-colors duration-150">
                    {option.title}
                  </h4>
                  <span className="bg-gray-100 text-gray-900 text-[11px] px-2.5 py-1 rounded-full font-body font-medium whitespace-nowrap">
                    {option.points} pts
                  </span>
                </div>
                <p className="text-[13px] sm:text-[14px] text-gray-600 font-body">
                  {option.description}
                </p>
                {isAuthenticated && (
                  <button
                    type="button"
                    disabled={userPoints < option.points}
                    className="mt-4 w-full bg-[#1E3024] text-white px-4 py-2 rounded-full hover:bg-[#1E3024]/90 font-medium transition-all duration-150 ease-out text-[13px] font-body disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {userPoints >= option.points ? "Redeem" : "Not enough points"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-gray-50 rounded-sm border border-gray-200 p-6 sm:p-8">
          <h3 className="text-[24px] sm:text-[28px] font-heading mb-6 text-gray-900 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h4 className="text-[15px] sm:text-[16px] font-heading mb-2 text-gray-900 font-medium">
                How do I join the rewards program?
              </h4>
              <p className="text-[13px] sm:text-[14px] text-gray-600 font-body leading-relaxed">
                Simply create an account on our website. You'll automatically be
                enrolled in our Bronze tier and start earning points with your
                first purchase!
              </p>
            </div>

            <div>
              <h4 className="text-[15px] sm:text-[16px] font-heading mb-2 text-gray-900 font-medium">
                Do my points expire?
              </h4>
              <p className="text-[13px] sm:text-[14px] text-gray-600 font-body leading-relaxed">
                Points are valid for 12 months from the date they're earned. Make
                a purchase within that time to keep your points active!
              </p>
            </div>

            <div>
              <h4 className="text-[15px] sm:text-[16px] font-heading mb-2 text-gray-900 font-medium">
                Can I combine points with other discounts?
              </h4>
              <p className="text-[13px] sm:text-[14px] text-gray-600 font-body leading-relaxed">
                Points can be combined with most promotions, but not with other
                discount codes. Check the terms during checkout for specific
                offers.
              </p>
            </div>

            <div>
              <h4 className="text-[15px] sm:text-[16px] font-heading mb-2 text-gray-900 font-medium">
                How do I check my points balance?
              </h4>
              <p className="text-[13px] sm:text-[14px] text-gray-600 font-body leading-relaxed">
                You can view your current points balance in your account
                dashboard, or on this rewards page when you're logged in.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="mt-12 text-center bg-gradient-to-br from-[#1E3024] to-[#40702A] rounded-sm p-8 sm:p-12">
            <h3 className="text-[24px] sm:text-[32px] font-heading mb-4 text-white">
              Ready to Start Earning?
            </h3>
            <p className="text-[15px] sm:text-[16px] text-white/90 mb-6 font-body max-w-2xl mx-auto">
              Create your free account today and start earning points on every
              purchase. Exclusive rewards are waiting for you!
            </p>
            <Link
              href="/auth/signup"
              className="bg-white text-[#1E3024] px-8 py-3 rounded-full hover:bg-gray-100 font-medium transition-all duration-150 ease-out hover:shadow-md text-[14px] sm:text-[15px] font-body inline-block"
            >
              Join the Rewards Program
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

