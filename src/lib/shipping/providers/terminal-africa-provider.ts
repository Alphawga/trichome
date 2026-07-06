import { CONTACT_EMAIL, CONTACT_PHONE, SITE_ADDRESS } from "@/lib/site-config";
import type { ShippingQuoteInput, ShippingRate } from "./types";

const TERMINAL_AFRICA_BASE_URL =
  process.env.TERMINAL_AFRICA_BASE_URL?.trim() ||
  "https://sandbox.terminal.africa/v1";
const REQUEST_TIMEOUT_MS = 4000;

// Generic small-parcel box (cm) — Product has no dimension fields today.
const DEFAULT_PACKAGE_DIMENSION = { length: 20, width: 20, height: 15 };

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
    line1: SITE_ADDRESS.streetAddress,
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

// NOTE: request-body shape (embedded address objects vs. address_id
// references from a separate POST /addresses call) is unverified against a
// real response as of this writing — Terminal Africa's account this store
// uses is still mid-KYC-review, and the API 401s with "Complete KYC
// verification to access the API" regardless of request shape. Built against
// the embedded-object contract since that's the one two independent doc
// queries gave consistent field names for. Re-verify with a live call once
// KYC clears — see docs/changelog and the terminal-africa-shipping skill.
async function fetchQuotes(
  input: ShippingQuoteInput,
): Promise<TerminalAfricaRate[]> {
  const requestBody = {
    currency: "NGN",
    parcel_total_weight: input.weightKg,
    parcel_value: input.subtotal,
    packages: [{ weight: input.weightKg, ...DEFAULT_PACKAGE_DIMENSION }],
    address_from: senderAddress(),
    address_to: receiverAddress(input.destination),
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
