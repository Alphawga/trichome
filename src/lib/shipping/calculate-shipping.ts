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
  /** Shipping method */
  method: "standard" | "express";
}

/**
 * Free shipping threshold in NGN
 */
const FREE_SHIPPING_THRESHOLD = 50000; // ₦50,000

/**
 * Base shipping costs by state (in NGN)
 * Lagos and Abuja have lower costs due to proximity to warehouses
 */
const STATE_SHIPPING_COSTS: Record<string, number> = {
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
const DELIVERY_DAYS: Record<string, number> = {
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
  default: 3,
};

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
    city: _city,
    country: _country = "Nigeria",
  } = input;

  // Check if order qualifies for free shipping
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      isFree: true,
      estimatedDays: state
        ? DELIVERY_DAYS[state] || DELIVERY_DAYS.default
        : DELIVERY_DAYS.default,
      method: "standard",
    };
  }

  // Get base shipping cost for state
  const stateKey = state || "default";
  const baseCost =
    STATE_SHIPPING_COSTS[stateKey] || STATE_SHIPPING_COSTS.default;

  // Calculate weight multiplier
  const weightMultiplier =
    WEIGHT_MULTIPLIERS.find((range) => weight <= range.maxWeight)?.multiplier ||
    WEIGHT_MULTIPLIERS[WEIGHT_MULTIPLIERS.length - 1].multiplier;

  // Calculate final shipping cost
  const cost = Math.round(baseCost * weightMultiplier);

  // Get estimated delivery days
  const estimatedDays = DELIVERY_DAYS[stateKey] || DELIVERY_DAYS.default;

  return {
    cost,
    isFree: false,
    estimatedDays,
    method: "standard",
  };
}

/**
 * Calculate express shipping cost (2x standard, 1 day faster)
 */
export function calculateExpressShipping(
  input: ShippingCalculationInput,
): ShippingCalculationResult {
  const standard = calculateShipping(input);

  if (standard.isFree) {
    return standard; // Free shipping applies to express too
  }

  return {
    cost: standard.cost * 2,
    isFree: false,
    estimatedDays: Math.max(1, standard.estimatedDays - 1),
    method: "express",
  };
}

/**
 * Get available shipping methods for an order
 */
export function getAvailableShippingMethods(
  input: ShippingCalculationInput,
): Array<{
  method: "standard" | "express";
  cost: number;
  estimatedDays: number;
  label: string;
}> {
  const standard = calculateShipping(input);
  const express = calculateExpressShipping(input);

  return [
    {
      method: "standard",
      cost: standard.cost,
      estimatedDays: standard.estimatedDays,
      label: `Standard Delivery (${standard.estimatedDays} ${standard.estimatedDays === 1 ? "day" : "days"})`,
    },
    {
      method: "express",
      cost: express.cost,
      estimatedDays: express.estimatedDays,
      label: `Express Delivery (${express.estimatedDays} ${express.estimatedDays === 1 ? "day" : "days"})`,
    },
  ];
}

/**
 * Format shipping cost for display
 */
export function formatShippingCost(cost: number): string {
  if (cost === 0) {
    return "Free";
  }
  return `₦${cost.toLocaleString()}`;
}
