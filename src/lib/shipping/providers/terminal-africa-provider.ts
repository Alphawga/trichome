import { CONTACT_EMAIL, CONTACT_PHONE, SITE_ADDRESS } from "@/lib/site-config";
import type { ShippingQuoteInput, ShippingRate } from "./types";

const TERMINAL_AFRICA_BASE_URL =
  process.env.TERMINAL_AFRICA_BASE_URL?.trim() ||
  "https://sandbox.terminal.africa/v1";
const REQUEST_TIMEOUT_MS = 4000;

interface TerminalAfricaRate {
  amount: number;
  carrier_name: string;
  carrier_rate_description?: string;
  delivery_eta?: number; // minutes
}

interface TerminalAfricaQuoteResponse {
  status: boolean;
  message?: string;
  data?: TerminalAfricaRate[];
}

export class TerminalAfricaIncompleteRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TerminalAfricaIncompleteRequestError";
  }
}

// Single source of truth for "does this destination have everything a live
// quote needs" — mirrors the equivalent Shipbubble-era check so the gate in
// get-shipping-rate.ts can't drift from this provider's own requirements.
export function hasCompleteDestinationForLiveQuote(
  destination: ShippingQuoteInput["destination"],
): boolean {
  return Boolean(
    destination.addressLine &&
      destination.contactName &&
      destination.contactEmail &&
      destination.contactPhone,
  );
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TERMINAL_SECRET_KEY}`,
  };
}

function splitName(fullName: string): {
  first_name: string;
  last_name: string;
} {
  const [first_name, ...rest] = fullName.trim().split(/\s+/);
  return { first_name, last_name: rest.join(" ") || first_name };
}

function senderAddress() {
  return {
    ...splitName("Trichomes Cosmeceuticals"),
    line1: SITE_ADDRESS.shippingLine1,
    line2: SITE_ADDRESS.shippingLine2,
    city: SITE_ADDRESS.addressLocality,
    state: SITE_ADDRESS.addressRegion,
    country: SITE_ADDRESS.addressCountry,
    zip: SITE_ADDRESS.postalCode,
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
  };
}

function receiverAddress(destination: ShippingQuoteInput["destination"]) {
  return {
    ...splitName(destination.contactName as string),
    line1: destination.addressLine,
    city: destination.city,
    state: destination.state,
    country: destination.country === "Nigeria" ? "NG" : destination.country,
    zip: destination.postalCode,
    email: destination.contactEmail,
    phone: destination.contactPhone,
  };
}

// Request-body shape confirmed against a real live response 2026-07-07
// (KYC cleared): the docs' embedded-object contract, but under
// pickup_address/delivery_address/parcel — not address_from/address_to/
// packages as originally built from a doc-summary contradiction. packaging_id
// is intentionally omitted (only required when persist_data: true, which
// this quote-only flow doesn't set) — Terminal applies a default packaging.
async function fetchQuotes(
  input: ShippingQuoteInput,
): Promise<TerminalAfricaRate[]> {
  const requestBody = {
    currency: "NGN",
    pickup_address: senderAddress(),
    delivery_address: receiverAddress(input.destination),
    parcel: {
      description: "Trichomes Cosmeceuticals order",
      weight_unit: "kg",
      items: input.items.map((item) => ({
        name: item.name,
        description: item.name,
        currency: "NGN",
        value: item.unitAmount * item.quantity,
        quantity: item.quantity,
        weight: item.unitWeightKg,
        type: "parcel",
      })),
    },
  };

  const response = await fetch(
    `${TERMINAL_AFRICA_BASE_URL}/rates/shipment/quotes`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );

  const responseBody: TerminalAfricaQuoteResponse = await response.json();

  if (!response.ok) {
    console.error(
      "Terminal Africa fetch_rates failed:",
      response.status,
      responseBody,
    );
    throw new Error(`Terminal Africa fetch_rates failed: ${response.status}`);
  }

  if (!responseBody.data?.length) {
    throw new Error("Terminal Africa fetch_rates returned no rates");
  }

  return responseBody.data;
}

// Terminal Africa's delivery_eta is in minutes, unlike Shipbubble's human
// ETA string — a different unit, not just a different field name.
function estimateDaysFromEtaMinutes(minutes: number | undefined): number {
  if (!minutes || minutes <= 0) return 3;
  return Math.max(1, Math.ceil(minutes / 1440));
}

export const terminalAfricaProvider = {
  name: "terminal-africa",
  async getRates(input: ShippingQuoteInput): Promise<ShippingRate[]> {
    if (!hasCompleteDestinationForLiveQuote(input.destination)) {
      throw new TerminalAfricaIncompleteRequestError(
        "Terminal Africa: missing contact/address details required for a rate quote",
      );
    }

    const rates = await fetchQuotes(input);
    const cheapest = rates.reduce((min, rate) =>
      rate.amount < min.amount ? rate : min,
    );

    return [
      {
        courier: cheapest.carrier_name,
        cost: cheapest.amount,
        estimatedDays: estimateDaysFromEtaMinutes(cheapest.delivery_eta),
        source: "live",
      },
    ];
  },
};
