import { staticFallbackProvider } from "./providers/static-fallback-provider";
import {
  hasCompleteDestinationForLiveQuote,
  terminalAfricaProvider,
} from "./providers/terminal-africa-provider";
import type { ShippingQuoteInput, ShippingRate } from "./providers/types";

export type { ShippingQuoteInput, ShippingRate };

export async function getShippingRates(
  input: ShippingQuoteInput,
): Promise<ShippingRate[]> {
  if (process.env.TERMINAL_SECRET_KEY) {
    if (hasCompleteDestinationForLiveQuote(input.destination)) {
      try {
        const rates = await terminalAfricaProvider.getRates(input);
        if (rates.length > 0) return rates;
      } catch (error) {
        console.error(
          "Terminal Africa rate lookup failed, falling back to static rates:",
          error,
        );
      }
    } else {
      console.warn(
        "Terminal Africa: skipping live quote — request missing addressLine/contactName/contactEmail/contactPhone. This means the caller (checkout's shipping-rate query or order-creation's computeServerShippingCost) sent an incomplete address, not a Terminal Africa outage.",
      );
    }
  }

  return staticFallbackProvider.getRates(input);
}
