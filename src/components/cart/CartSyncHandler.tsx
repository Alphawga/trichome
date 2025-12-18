"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { useCartSync } from "@/hooks/useCartSync";
import { getLocalCart } from "@/utils/local-cart";

/**
 * CartSyncHandler Component
 *
 * Automatically syncs localStorage cart with database cart when user logs in
 * This component should be placed in the app layout to monitor auth state changes
 */
export function CartSyncHandler() {
  const { isAuthenticated, isLoading } = useAuth();
  const { syncCart } = useCartSync();
  const hasSyncedRef = useRef(false);
  const previousAuthStateRef = useRef(false);

  useEffect(() => {
    // Debug logging
    console.log("CartSyncHandler check:", {
      isLoading,
      isAuthenticated,
      prevAuth: previousAuthStateRef.current,
      hasSynced: hasSyncedRef.current,
      localCartSize: getLocalCart().length
    });

    if (
      !isLoading &&
      isAuthenticated &&
      !previousAuthStateRef.current &&
      !hasSyncedRef.current
    ) {
      const localCart = getLocalCart();
      console.log("Attempting to sync cart...", localCart);

      if (localCart.length > 0) {
        // User just logged in and has items in localStorage
        syncCart().then((result) => {
          console.log("Cart sync result:", result);
          hasSyncedRef.current = true;
        }).catch(err => {
          console.error("Cart sync failed:", err);
        });
      } else {
        // No local cart to sync, but mark as synced
        hasSyncedRef.current = true;
      }
    }

    // Update previous auth state
    if (!isLoading) {
      previousAuthStateRef.current = isAuthenticated;
    }

    // Reset sync flag when user logs out
    if (!isAuthenticated && !isLoading) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated, isLoading, syncCart]);

  // Don't render anything - this is a side-effect component
  return null;
}
