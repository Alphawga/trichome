/**
 * Cart Sync Utility
 * Handles merging localStorage cart with database cart
 *
 * Strategy:
 * - For items in both carts: keep maximum quantity
 * - For items only in localStorage: add to database
 * - For items only in database: keep as is
 * - Clear localStorage after successful sync
 */

import type { LocalCartItem } from "@/utils/local-cart";

export interface CartSyncResult {
  /** Number of items merged */
  mergedCount: number;
  /** Number of items added from localStorage */
  addedCount: number;
  /** Number of items that had quantity conflicts (kept maximum) */
  conflictCount: number;
  /** Product names that were merged */
  mergedProducts: string[];
}

export interface DatabaseCartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number | string;
  };
}

export interface LocalCartItemWithProduct extends LocalCartItem {
  product?: {
    id: string;
    name: string;
    price: number | string;
  };
}

/**
 * Compare two carts and determine sync actions
 * Returns items that need to be added/updated
 */
export function compareCarts(
  localCart: LocalCartItem[],
  dbCart: DatabaseCartItem[],
): {
  toAdd: LocalCartItem[];
  toUpdate: Array<{ cartItemId: string; product_id: string; quantity: number }>;
  conflicts: Array<{
    product_id: string;
    localQty: number;
    dbQty: number;
    finalQty: number;
    productName: string;
  }>;
} {
  const toAdd: LocalCartItem[] = [];
  const toUpdate: Array<{
    cartItemId: string;
    product_id: string;
    quantity: number;
  }> = [];
  const conflicts: Array<{
    product_id: string;
    localQty: number;
    dbQty: number;
    finalQty: number;
    productName: string;
  }> = [];

  // Create a map of database cart items by product_id
  const dbCartMap = new Map<string, DatabaseCartItem>();
  dbCart.forEach((item) => {
    dbCartMap.set(item.product_id, item);
  });

  // Process each local cart item
  localCart.forEach((localItem) => {
    const dbItem = dbCartMap.get(localItem.product_id);

    if (!dbItem) {
      // Item only exists in localStorage - add it
      toAdd.push(localItem);
    } else {
      // Item exists in both - check quantities
      const localQty = localItem.quantity;
      const dbQty = dbItem.quantity;
      const finalQty = Math.max(localQty, dbQty);

      if (finalQty !== dbQty) {
        // Quantities differ - update to maximum
        toUpdate.push({
          cartItemId: dbItem.id,
          product_id: localItem.product_id,
          quantity: finalQty,
        });

        if (localQty !== dbQty) {
          // There was a conflict
          conflicts.push({
            product_id: localItem.product_id,
            localQty,
            dbQty,
            finalQty,
            productName: dbItem.product.name,
          });
        }
      }
    }
  });

  return { toAdd, toUpdate, conflicts };
}

/**
 * Calculate sync statistics
 */
export function calculateSyncStats(
  toAdd: LocalCartItem[],
  toUpdate: Array<{ cartItemId: string; product_id: string; quantity: number }>,
  conflicts: Array<{
    product_id: string;
    localQty: number;
    dbQty: number;
    finalQty: number;
    productName: string;
  }>,
): CartSyncResult {
  return {
    mergedCount: toAdd.length + toUpdate.length,
    addedCount: toAdd.length,
    conflictCount: conflicts.length,
    mergedProducts: conflicts.map((c) => c.productName),
  };
}
