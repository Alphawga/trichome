"use client";

interface AutoAppliedPromo {
  promotionId: string;
  name: string;
  discount: number;
  isFreeShipping: boolean;
}

interface AppliedPromoCode {
  code: string;
  discount: number;
  isFreeShipping: boolean;
}

interface PromoCodeSectionProps {
  autoAppliedPromos: AutoAppliedPromo[];
  appliedPromoCode: AppliedPromoCode | null;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  promoCodeError: string | null;
  isApplyingCode: boolean;
  onApply: () => void;
  onRemove: () => void;
}

/**
 * Auto-applied promotion list + manual code entry/applied chip. Shared by
 * the cart page and checkout so the UI stays identical between them.
 */
export function PromoCodeSection({
  autoAppliedPromos,
  appliedPromoCode,
  promoCode,
  onPromoCodeChange,
  promoCodeError,
  isApplyingCode,
  onApply,
  onRemove,
}: PromoCodeSectionProps) {
  return (
    <div className="mt-4">
      {autoAppliedPromos.length > 0 && (
        <ul className="mb-2 space-y-1">
          {autoAppliedPromos.map((promo) => (
            <li
              key={promo.promotionId}
              className="text-xs text-trichomes-primary font-body"
            >
              &quot;{promo.name}&quot; auto-applied
              {promo.isFreeShipping
                ? " — free shipping"
                : ` — -₦${promo.discount.toLocaleString()}`}
            </li>
          ))}
        </ul>
      )}
      {!appliedPromoCode ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 bg-white rounded-sm focus:ring-1 focus:ring-black focus:border-black outline-none font-body"
            />
            <button
              type="button"
              onClick={onApply}
              disabled={isApplyingCode || !promoCode.trim()}
              className="px-4 py-2 text-sm bg-black text-white rounded-sm hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-body"
            >
              {isApplyingCode ? "..." : "Apply"}
            </button>
          </div>
          {promoCodeError && (
            <p className="text-xs text-red-600 font-body">{promoCodeError}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 font-body">
              {appliedPromoCode.code}
            </span>
            {appliedPromoCode.isFreeShipping ? (
              <span className="text-xs text-gray-600 font-body">
                Free Shipping
              </span>
            ) : (
              <span className="text-xs text-gray-600 font-body">
                -₦{appliedPromoCode.discount.toLocaleString()}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 hover:text-red-700 font-body"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
