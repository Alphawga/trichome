"use client";

import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number | string;
  total: number | string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string }>;
  };
}

interface OrderItemListProps {
  /** Order items array */
  items: OrderItem[];
  /** Show product images */
  showImages?: boolean;
  /** Show product links */
  showLinks?: boolean;
  /** Compact view */
  compact?: boolean;
}

/**
 * Reusable OrderItemList component
 * Displays list of order items with images and details
 */
export function OrderItemList({
  items,
  showImages = true,
  showLinks = true,
  compact = false,
}: OrderItemListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemPrice =
          typeof item.price === "string" ? parseFloat(item.price) : item.price;
        const itemTotal =
          typeof item.total === "string" ? parseFloat(item.total) : item.total;
        const productName = item.product?.name || item.product_name;
        const productId = item.product?.id || item.product_id;
        const productImage =
          item.product?.images?.[0]?.url || "/placeholder-product.png";

        return (
          <div
            key={item.id}
            className={`bg-white p-4 sm:p-6 border border-trichomes-forest/10 flex flex-col sm:flex-row items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out ${
              compact ? "p-3 sm:p-4" : ""
            }`}
          >
            {/* Product Image */}
            {showImages && (
              <div
                className={`relative flex-shrink-0 ${compact ? "w-16 h-16" : "w-20 h-20 sm:w-24 sm:h-24"}`}
              >
                {showLinks ? (
                  <Link href={`/products/${productId}`}>
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      className="object-cover bg-trichomes-sage cursor-pointer"
                    />
                  </Link>
                ) : (
                  <Image
                    src={productImage}
                    alt={productName}
                    fill
                    className="object-cover bg-trichomes-sage"
                  />
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="flex-grow w-full sm:w-auto text-center sm:text-left">
              {showLinks ? (
                <Link
                  href={`/products/${productId}`}
                  className="font-heading text-[15px] sm:text-[16px] hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest"
                >
                  {productName}
                </Link>
              ) : (
                <p className="font-heading text-[15px] sm:text-[16px] text-trichomes-forest">
                  {productName}
                </p>
              )}
              <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 mt-1 font-body">
                Quantity: {item.quantity}
              </p>
              <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 mt-1 font-body">
                Unit price: ₦
                {itemPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Price */}
            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
              <p className="text-[16px] sm:text-[18px] font-heading font-bold text-trichomes-forest">
                ₦
                {itemTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
