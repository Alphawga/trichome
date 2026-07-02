"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  type CartSyncResult,
  calculateSyncStats,
  compareCarts,
} from "@/lib/cart/sync-cart";
import { clearLocalCart, getLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";

/**
 * Hook for syncing localStorage cart with database cart
 *
 * Features:
 * - Merges localStorage cart with database cart on login
 * - Handles quantity conflicts (keeps maximum)
 * - Shows notification about merged items
 * - Clears localStorage after successful sync
 */
export function useCartSync() {
  const utils = trpc.useUtils();

  const mergeCartMutation = trpc.mergeCart.useMutation();

  /**
   * Sync localStorage cart with database cart
   * Called after user logs in
   */
  const syncCart = useCallback(async (): Promise<CartSyncResult | null> => {
    let loadingToastId: string | number | undefined;
    try {
      // Get localStorage cart
      const localCart = getLocalCart();

      if (localCart.length === 0) {
        // No local cart to sync
        return null;
      }

      // Get database cart
      const dbCart = await utils.getCart.fetch();
      const dbCartItems = dbCart?.items || [];

      // Compare carts and determine sync actions
      const { toAdd, toUpdate, conflicts } = compareCarts(
        localCart,
        dbCartItems,
      );

      // If nothing to sync, return early
      if (toAdd.length === 0 && toUpdate.length === 0) {
        clearLocalCart();
        return null;
      }

      loadingToastId = toast.loading("Syncing your cart...");

      // Merge all adds/updates in a single round trip
      await mergeCartMutation.mutateAsync({
        toAdd: toAdd.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        toUpdate: toUpdate.map((item) => ({
          id: item.cartItemId,
          quantity: item.quantity,
        })),
      });

      // Calculate sync statistics
      const stats = calculateSyncStats(toAdd, toUpdate, conflicts);

      // Clear localStorage after successful sync
      clearLocalCart();

      // Invalidate cart query to refresh UI
      await utils.getCart.invalidate();

      toast.dismiss(loadingToastId);

      // Show notification
      if (stats.mergedCount > 0) {
        if (stats.conflictCount > 0) {
          toast.success("Cart synced", {
            description: `${stats.mergedCount} item(s) merged. ${stats.conflictCount} item(s) had quantity conflicts - kept maximum quantity.`,
            duration: 5000,
          });
        } else {
          toast.success("Cart synced", {
            description: `${stats.mergedCount} item(s) from your guest session have been added to your cart.`,
          });
        }
      }

      return stats;
    } catch (error) {
      if (loadingToastId !== undefined) toast.dismiss(loadingToastId);
      console.error("Cart sync error:", error);
      toast.error("Failed to sync cart", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while syncing your cart.",
      });
      return null;
    }
  }, [mergeCartMutation, utils]);

  return {
    syncCart,
    isSyncing: mergeCartMutation.isPending,
  };
}
