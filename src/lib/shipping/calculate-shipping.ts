/**
 * Shipping Calculation Utilities
 *
 * Calculates shipping costs based on location, weight, and order value.
 * Follows Trichomes Design Guide principles:
 * - Reusable utility functions
 * - Type-safe
 * - Centralized logic
 */

export interface ShippingCalculationInput {
  /** Subtotal of the order */
  subtotal: number;
  /** Total weight of items in kg */
  weight: number;
  /** Shipping state/city */
  state?: string;
  /** Shipping city */
  city?: string;
  /** Postal code */
  postalCode?: string;
  /** Country (default: Nigeria) */
  country?: string;
}

export interface ShippingCalculationResult {
  /** Calculated shipping cost */
  cost: number;
  /** Whether shipping is free */
  isFree: boolean;
  /** Estimated delivery days */
  estimatedDays: number;
}

/**
 * Free shipping threshold for Akure orders, in NGN
 */
const AKURE_FREE_SHIPPING_THRESHOLD = 20000; // ₦20,000

/**
 * Base shipping costs by state (in NGN)
 * Lagos and Abuja have lower costs due to proximity to warehouses
 */
export const STATE_SHIPPING_COSTS: Record<string, number> = {
  Lagos: 3000,
  Abuja: 3500,
  Rivers: 4000,
  Kano: 4500,
  Ogun: 3500,
  Delta: 4000,
  Kaduna: 4500,
  Oyo: 4000,
  Edo: 4000,
  Enugu: 4500,
  Ondo: 4500,
  // Default for other states
  default: 5000,
};

/**
 * Weight-based shipping multiplier
 * Base cost is multiplied by weight factor
 */
const WEIGHT_MULTIPLIERS: Array<{ maxWeight: number; multiplier: number }> = [
  { maxWeight: 1, multiplier: 1.0 }, // 0-1kg: 1x
  { maxWeight: 3, multiplier: 1.3 }, // 1-3kg: 1.3x
  { maxWeight: 5, multiplier: 1.6 }, // 3-5kg: 1.6x
  { maxWeight: 10, multiplier: 2.0 }, // 5-10kg: 2.0x
  { maxWeight: Infinity, multiplier: 2.5 }, // 10kg+: 2.5x
];

/**
 * Estimated delivery days by state
 */
export const DELIVERY_DAYS: Record<string, number> = {
  Lagos: 1,
  Abuja: 2,
  Rivers: 2,
  Kano: 3,
  Ogun: 2,
  Delta: 2,
  Kaduna: 3,
  Oyo: 2,
  Edo: 2,
  Enugu: 3,
  Ondo: 2,
  default: 3,
};

/**
 * Normalizes a free-text state name for matching against STATE_SHIPPING_COSTS/
 * DELIVERY_DAYS keys: trims, lowercases, and strips a trailing "state" suffix
 * (e.g. "Oyo state" / " OYO STATE " both resolve to "oyo").
 */
function normalizeStateKey(state: string): string {
  return state
    .trim()
    .toLowerCase()
    .replace(/\s*state$/i, "");
}

function lookupByNormalizedState<T>(
  table: Record<string, T>,
  stateKey: string,
): T | undefined {
  const normalized = normalizeStateKey(stateKey);
  const match = Object.keys(table).find(
    (key) => normalizeStateKey(key) === normalized,
  );
  return match ? table[match] : undefined;
}

/**
 * Calculate shipping cost based on order details
 */
export function calculateShipping(
  input: ShippingCalculationInput,
): ShippingCalculationResult {
  const {
    subtotal,
    weight = 0,
    state,
    city,
    country: _country = "Nigeria",
  } = input;

  // Free shipping for Akure orders above the Akure threshold
  const isAkure = city?.trim().toLowerCase() === "akure";
  if (isAkure && subtotal >= AKURE_FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      isFree: true,
      estimatedDays:
        (state && lookupByNormalizedState(DELIVERY_DAYS, state)) ||
        DELIVERY_DAYS.default,
    };
  }

  // Get base shipping cost for state
  const baseCost =
    (state && lookupByNormalizedState(STATE_SHIPPING_COSTS, state)) ||
    STATE_SHIPPING_COSTS.default;

  // Calculate weight multiplier
  const weightMultiplier =
    WEIGHT_MULTIPLIERS.find((range) => weight <= range.maxWeight)?.multiplier ||
    WEIGHT_MULTIPLIERS[WEIGHT_MULTIPLIERS.length - 1].multiplier;

  // Calculate final shipping cost
  const cost = Math.round(baseCost * weightMultiplier);

  // Get estimated delivery days
  const estimatedDays =
    (state && lookupByNormalizedState(DELIVERY_DAYS, state)) ||
    DELIVERY_DAYS.default;

  return {
    cost,
    isFree: false,
    estimatedDays,
  };
}
