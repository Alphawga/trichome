/**
 * Cart Helper Functions
 * Utility functions for cart operations
 */

import type { LocalCartItem } from "@/utils/local-cart";

/**
 * Validate cart item quantity
 */
export function validateQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}

/**
 * Calculate cart total
 */
export function calculateCartTotal(
  items: Array<{ quantity: number; price: number | string }>,
): number {
  return items.reduce((total, item) => {
    const price =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return total + price * item.quantity;
  }, 0);
}

/**
 * Get unique product IDs from cart items
 */
export function getProductIds(items: LocalCartItem[]): string[] {
  return items.map((item) => item.product_id);
}

/**
 * Check if cart is empty
 */
export function isCartEmpty(items: LocalCartItem[] | unknown[]): boolean {
  return !items || items.length === 0;
}

/**
 * Get total item count in cart
 */
export function getCartItemCount(items: Array<{ quantity: number }>): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
