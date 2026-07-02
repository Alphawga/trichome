import type { ShippingQuoteInput, ShippingRate } from "./types";

const SHIPBUBBLE_BASE_URL = "https://api.shipbubble.com/v1";
const REQUEST_TIMEOUT_MS = 4000;

// Generic small-parcel box (cm) — Product has no dimension fields today.
const DEFAULT_PACKAGE_DIMENSION = { length: 20, width: 20, height: 15 };

interface ShipbubbleAddressData {
  address_code: number;
}

interface ShipbubbleCourier {
  courier_name: string;
  rate_card_amount: number;
  pickup_eta_time?: string;
  delivery_eta_time?: string;
}

interface ShipbubbleRatesData {
  request_token: string;
  couriers: ShipbubbleCourier[];
  cheapest_courier?: ShipbubbleCourier;
  fastest_courier?: ShipbubbleCourier;
}

const receiverAddressCache = new Map<string, number>();

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHIPBUBBLE_API_KEY}`,
  };
}

async function validateReceiverAddress(
  destination: ShippingQuoteInput["destination"],
): Promise<number> {
  if (
    !destination.addressLine ||
    !destination.contactName ||
    !destination.contactEmail ||
    !destination.contactPhone
  ) {
    throw new Error(
      "Shipbubble: missing contact/address details required for address validation",
    );
  }

  const cacheKey = [
    destination.addressLine,
    destination.city,
    destination.state,
    destination.postalCode,
  ]
    .join("|")
    .toLowerCase();

  const cached = receiverAddressCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(
    `${SHIPBUBBLE_BASE_URL}/shipping/address/validate`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: destination.contactName,
        email: destination.contactEmail,
        phone: destination.contactPhone,
        address: [
          destination.addressLine,
          destination.city,
          destination.state,
          destination.country,
        ]
          .filter(Boolean)
          .join(", "),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );

  const responseBody = await response.json();

  if (!response.ok) {
    console.error(
      "Shipbubble address validation failed:",
      response.status,
      responseBody,
    );
    throw new Error(`Shipbubble address validation failed: ${response.status}`);
  }

  const body: { data?: ShipbubbleAddressData } = responseBody;
  if (!body.data?.address_code) {
    throw new Error("Shipbubble address validation returned no address_code");
  }

  receiverAddressCache.set(cacheKey, body.data.address_code);
  return body.data.address_code;
}

function nextBusinessDay(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1); // Sunday -> Monday
  if (date.getDay() === 6) date.setDate(date.getDate() + 2); // Saturday -> Monday
  return date.toISOString().slice(0, 10);
}

async function fetchRates(
  receiverAddressCode: number,
  input: ShippingQuoteInput,
): Promise<ShipbubbleRatesData> {
  const requestBody = {
    sender_address_code: Number(process.env.SHIPBUBBLE_SENDER_ADDRESS_CODE),
    reciever_address_code: receiverAddressCode,
    pickup_date: nextBusinessDay(),
    category_id: Number(process.env.SHIPBUBBLE_CATEGORY_ID),
    package_items: input.items.map((item) => ({
      name: item.name,
      description: item.name,
      unit_weight: item.unitWeightKg,
      unit_amount: item.unitAmount,
      quantity: item.quantity,
    })),
    package_dimension: DEFAULT_PACKAGE_DIMENSION,
  };

  const response = await fetch(`${SHIPBUBBLE_BASE_URL}/shipping/fetch_rates`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    console.error(
      "Shipbubble fetch_rates failed:",
      response.status,
      responseBody,
    );
    throw new Error(`Shipbubble fetch_rates failed: ${response.status}`);
  }

  const body: { data?: ShipbubbleRatesData } = responseBody;
  if (!body.data?.couriers?.length) {
    throw new Error("Shipbubble fetch_rates returned no couriers");
  }

  return body.data;
}

function estimateDaysFromEta(eta: string | undefined): number {
  if (!eta) return 3;
  const match = eta.match(/(\d+)/);
  return match ? Number(match[1]) : 3;
}

export const shipbubbleProvider = {
  name: "shipbubble",
  async getRates(input: ShippingQuoteInput): Promise<ShippingRate[]> {
    const receiverAddressCode = await validateReceiverAddress(
      input.destination,
    );
    const rates = await fetchRates(receiverAddressCode, input);

    const cheapest = rates.cheapest_courier ?? rates.couriers[0];
    const fastest = rates.fastest_courier ?? rates.couriers[0];

    return [
      {
        courier: cheapest.courier_name,
        cost: cheapest.rate_card_amount,
        estimatedDays: estimateDaysFromEta(cheapest.delivery_eta_time),
        method: "standard",
        source: "live",
      },
      {
        courier: fastest.courier_name,
        cost: fastest.rate_card_amount,
        estimatedDays: estimateDaysFromEta(fastest.delivery_eta_time),
        method: "express",
        source: "live",
      },
    ];
  },
};
