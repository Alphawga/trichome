export interface ShippingQuoteInput {
  destination: {
    state: string;
    city?: string;
    postalCode?: string;
    country?: string;
    /** Free-text street address, required by carriers that need address validation */
    addressLine?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  /** Combined weight of all items in the shipment, in kg */
  weightKg: number;
  /** Order subtotal, used to evaluate free-shipping thresholds */
  subtotal: number;
  /** Cart items, needed by carrier APIs that require a package manifest */
  items: Array<{
    name: string;
    unitWeightKg: number;
    unitAmount: number;
    quantity: number;
  }>;
}

export interface ShippingRate {
  courier: string;
  cost: number;
  estimatedDays: number;
  source: "live" | "static";
  /**
   * Resolved/geocoded state for this destination, when a live provider's
   * address validation echoes one back. Currently unused — Terminal
   * Africa's rate-quote response doesn't echo a normalized address. Kept
   * optional for a future provider that does. Display-only — never used to
   * overwrite the customer's own entered address.
   */
  resolvedState?: string;
}

export interface ShippingRateProvider {
  name: string;
  getRates(input: ShippingQuoteInput): Promise<ShippingRate[]>;
}
