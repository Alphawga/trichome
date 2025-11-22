"use client";

import type { ReactNode } from "react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number | string;
  total?: number | string;
  product?: {
    name: string;
    images?: Array<{ url: string }>;
  };
}

interface OrderSummaryProps {
  /** Order items array */
  items: OrderItem[];
  /** Subtotal amount */
  subtotal: number;
  /** Shipping cost */
  shipping: number;
  /** Tax amount */
  tax: number;
  /** Discount amount (optional) */
  discount?: number;
  /** Total amount */
  total: number;
  /** Show action buttons (checkout button, etc.) */
  showActions?: boolean;
  /** Variant for different display contexts */
  variant?: "checkout" | "confirmation" | "history";
  /** Custom action button (optional) */
  actionButton?: ReactNode;
  /** Show item details */
  showItemDetails?: boolean;
}

/**
 * Reusable OrderSummary component
 * Displays order summary with items, totals, and optional actions
 * Used across checkout, confirmation, and order history pages
 */
export function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  discount = 0,
  total,
  showActions = false,
  variant = "checkout",
  actionButton,
  showItemDetails = true,
}: OrderSummaryProps) {
  const itemCount = items.length;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
      <h2 className="text-[20px] sm:text-[24px] font-heading font-bold mb-4 sm:mb-6 text-trichomes-forest">
        {variant === "confirmation" ? "Order Summary" : "Order Summary"}
      </h2>

      {/* Order Items */}
      {showItemDetails && (
        <div className="mb-4 sm:mb-6">
          <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] mb-3 sm:mb-4 text-trichomes-forest">
            Items ({itemCount})
          </h3>
          <div className="space-y-3">
            {items.map((item) => {
              const itemPrice =
                typeof item.price === "string"
                  ? parseFloat(item.price)
                  : item.price;
              const itemTotal = item.total
                ? typeof item.total === "string"
                  ? parseFloat(item.total)
                  : item.total
                : itemPrice * item.quantity;
              const productName = item.product?.name || item.product_name;

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-start text-[13px] sm:text-[14px] font-body"
                >
                  <div className="flex-1">
                    <p className="font-medium text-trichomes-forest">
                      {productName}
                    </p>
                    <p className="text-trichomes-forest/60">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold ml-4 text-trichomes-forest">
                    ₦
                    {itemTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Totals */}
      <div className="space-y-3 text-trichomes-forest/70 border-t border-trichomes-forest/20 pt-4 font-body">
        <div className="flex justify-between text-[14px] sm:text-[15px]">
          <span>
            Subtotal{" "}
            {variant === "checkout" &&
              `(${totalItems} ${totalItems === 1 ? "item" : "items"})`}
          </span>
          <span className="font-semibold text-trichomes-forest">
            ₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between text-[14px] sm:text-[15px]">
          <span>Shipping</span>
          <span className="font-semibold text-trichomes-forest">
            {shipping === 0
              ? "Free"
              : `₦${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between text-[14px] sm:text-[15px]">
            <span>Tax {variant === "checkout" && "(7.5%)"}</span>
            <span className="font-semibold text-trichomes-forest">
              ₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-[14px] sm:text-[15px] text-trichomes-primary">
            <span>Discount</span>
            <span className="font-semibold">
              -₦
              {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <hr className="my-3 border-trichomes-forest/20" />

        <div className="flex justify-between text-[18px] sm:text-[20px] font-heading font-semibold text-trichomes-forest">
          <span>Total</span>
          <span>
            ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {showActions && actionButton && (
        <div className="mt-4 sm:mt-6">{actionButton}</div>
      )}

      {/* Security Badges (for checkout variant) */}
      {variant === "checkout" && (
        <div className="mt-6 pt-6 border-t border-trichomes-forest/20 text-[11px] sm:text-[12px] text-trichomes-forest/60 font-body space-y-2">
          <p className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <title>Secure</title>
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Secure 256-bit SSL encryption
          </p>
          <p className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <title>Guarantee</title>
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Money-back guarantee
          </p>
        </div>
      )}
    </div>
  );
}
