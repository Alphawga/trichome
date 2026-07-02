import { shipbubbleProvider } from "./providers/shipbubble-provider";
import { staticFallbackProvider } from "./providers/static-fallback-provider";
import type { ShippingQuoteInput, ShippingRate } from "./providers/types";

export type { ShippingQuoteInput, ShippingRate };

export async function getShippingRates(
  input: ShippingQuoteInput,
): Promise<ShippingRate[]> {
  if (process.env.SHIPBUBBLE_API_KEY) {
    try {
      const rates = await shipbubbleProvider.getRates(input);
      if (rates.length > 0) return rates;
    } catch (error) {
      console.error(
        "Shipbubble rate lookup failed, falling back to static rates:",
        error,
      );
    }
  }

  return staticFallbackProvider.getRates(input);
}
