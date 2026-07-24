/**
 * LocalStorage Promo Code Utility
 * Carries a promo code applied on the cart page over to checkout, so the
 * customer doesn't have to re-type it.
 */

const PROMO_STORAGE_KEY = "trichomes_pending_promo_code";

/**
 * Get the pending promo code from localStorage
 */
export const getPersistedPromoCode = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(PROMO_STORAGE_KEY);
  } catch (error) {
    console.error("Error reading persisted promo code:", error);
    return null;
  }
};

/**
 * Save the applied promo code to localStorage
 */
export const setPersistedPromoCode = (code: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PROMO_STORAGE_KEY, code);
  } catch (error) {
    console.error("Error saving persisted promo code:", error);
  }
};

/**
 * Clear the pending promo code from localStorage
 */
export const clearPersistedPromoCode = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROMO_STORAGE_KEY);
};
