import {
  calculateExpressShipping,
  calculateShipping,
} from "@/lib/shipping/calculate-shipping";
import type { ShippingQuoteInput, ShippingRate } from "./types";

export const staticFallbackProvider = {
  name: "static-fallback",
  async getRates(input: ShippingQuoteInput): Promise<ShippingRate[]> {
    const calcInput = {
      subtotal: input.subtotal,
      weight: input.weightKg,
      state: input.destination.state,
      city: input.destination.city,
      postalCode: input.destination.postalCode,
      country: input.destination.country,
    };

    const standard = calculateShipping(calcInput);
    const express = calculateExpressShipping(calcInput);

    return [
      {
        courier: "Standard Delivery",
        cost: standard.cost,
        estimatedDays: standard.estimatedDays,
        method: "standard",
        source: "static",
      },
      {
        courier: "Express Delivery",
        cost: express.cost,
        estimatedDays: express.estimatedDays,
        method: "express",
        source: "static",
      },
    ];
  },
};
