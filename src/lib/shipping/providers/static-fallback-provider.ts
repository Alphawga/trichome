import { calculateShipping } from "@/lib/shipping/calculate-shipping";
import type { ShippingQuoteInput, ShippingRate } from "./types";

export const staticFallbackProvider = {
  name: "static-fallback",
  async getRates(input: ShippingQuoteInput): Promise<ShippingRate[]> {
    const rate = calculateShipping({
      subtotal: input.subtotal,
      weight: input.weightKg,
      state: input.destination.state,
      city: input.destination.city,
      postalCode: input.destination.postalCode,
      country: input.destination.country,
    });

    return [
      {
        courier: "Delivery",
        cost: rate.cost,
        estimatedDays: rate.estimatedDays,
        source: "static",
      },
    ];
  },
};
