"use client";

import type { Promotion } from "@prisma/client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type PromotionWithDetails = Promotion & {
  _count?: {
    usages: number;
  };
  creator?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

interface PromotionViewSheetProps {
  promotion: PromotionWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromotionViewSheet({
  promotion,
  open,
  onOpenChange,
}: PromotionViewSheetProps) {
  if (!promotion) return null;

  const usageCount = promotion._count?.usages || 0;
  const usageLimit = promotion.usage_limit;
  const usagePercentage =
    usageLimit > 0 ? Math.min((usageCount / usageLimit) * 100, 100) : 0;

  const getDiscountText = () => {
    switch (promotion.type) {
      case "PERCENTAGE":
        return `${promotion.value}% OFF`;
      case "FIXED_AMOUNT":
        return `₦${Number(promotion.value).toLocaleString()} OFF`;
      case "FREE_SHIPPING":
        return "FREE SHIPPING";
      case "BUY_X_GET_Y":
        return "BUY X GET Y";
      default:
        return "";
    }
  };

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    EXPIRED: "bg-red-100 text-red-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
  };

  const targetLabels = {
    ALL: "All Customers",
    NEW_CUSTOMERS: "New Customers Only",
    VIP: "VIP Customers",
    SPECIFIC_GROUP: "Specific Group",
  };

  const isExpired = new Date(promotion.end_date) < new Date();
  const isScheduled = new Date(promotion.start_date) > new Date();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Promotion Details</SheetTitle>
          <SheetDescription>
            View complete promotion information and usage statistics
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Promotion Overview */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {promotion.name}
                </h3>
                <code className="inline-block mt-2 bg-white px-3 py-1.5 rounded text-lg font-mono border border-gray-300">
                  {promotion.code}
                </code>
              </div>
              <span
                className={`px-3 py-1.5 text-sm font-semibold rounded-full ${statusColors[promotion.status]}`}
              >
                {promotion.status}
              </span>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Discount</p>
                <p className="text-2xl font-bold text-green-600">
                  {getDiscountText()}
                </p>
              </div>
              {Number(promotion.min_order_value) > 0 && (
                <div className="text-center border-l pl-6">
                  <p className="text-sm text-gray-600">Min. Order</p>
                  <p className="text-xl font-semibold">
                    ₦{Number(promotion.min_order_value).toLocaleString()}
                  </p>
                </div>
              )}
              {promotion.max_discount && (
                <div className="text-center border-l pl-6">
                  <p className="text-sm text-gray-600">Max. Discount</p>
                  <p className="text-xl font-semibold">
                    ₦{Number(promotion.max_discount).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {promotion.description && (
              <p className="mt-4 text-gray-700 italic">
                {promotion.description}
              </p>
            )}
          </div>

          {/* Usage Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Usage Statistics</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Uses</span>
                  <span className="text-xl font-bold">
                    {usageCount} / {usageLimit || "∞"}
                  </span>
                </div>
                {usageLimit > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {promotion.usage_limit_per_user && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Per Customer Limit
                    </span>
                    <span className="font-semibold">
                      {promotion.usage_limit_per_user} uses
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining Uses</span>
                  <span className="font-semibold text-green-600">
                    {usageLimit > 0
                      ? Math.max(0, usageLimit - usageCount)
                      : "∞"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(promotion.start_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {isScheduled && (
                  <p className="text-xs text-blue-600 mt-1">Not started yet</p>
                )}
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">End Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(promotion.end_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {isExpired && (
                  <p className="text-xs text-red-600 mt-1">Expired</p>
                )}
              </div>
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-semibold">
                {Math.ceil(
                  (new Date(promotion.end_date).getTime() -
                    new Date(promotion.start_date).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </p>
            </div>
          </div>

          {/* Targeting */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Targeting</h3>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Target Audience</p>
              <p className="text-lg font-semibold text-purple-900">
                {targetLabels[promotion.target_customers]}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {new Date(promotion.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">
                  {new Date(promotion.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {promotion.creator && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By</span>
                  <span className="font-medium">
                    {promotion.creator.first_name || promotion.creator.last_name
                      ? `${promotion.creator.first_name || ""} ${promotion.creator.last_name || ""}`.trim()
                      : promotion.creator.email}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Promotion ID</span>
                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {promotion.id}
                </code>
              </div>
            </div>
          </div>

          {/* Status Alerts */}
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This promotion has expired and is no longer active
              </p>
            </div>
          )}
          {isScheduled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                ℹ️ This promotion is scheduled and will start on{" "}
                {new Date(promotion.start_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {usageLimit > 0 && usageCount >= usageLimit && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 font-medium">
                ⚠️ Usage limit reached - this promotion can no longer be used
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
