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
  method: "standard" | "express";
  source: "live" | "static";
}

export interface ShippingRateProvider {
  name: string;
  getRates(input: ShippingQuoteInput): Promise<ShippingRate[]>;
}
