import { getShippingRates } from "./get-shipping-rate";
import type { ShippingQuoteInput } from "./providers/types";

const baseInput: ShippingQuoteInput = {
  destination: { state: "Lagos" },
  weightKg: 0.5,
  subtotal: 10000,
  items: [
    { name: "Test Product", unitWeightKg: 0.5, unitAmount: 10000, quantity: 1 },
  ],
};

describe("getShippingRates (static fallback, no SHIPBUBBLE_API_KEY)", () => {
  const originalKey = process.env.SHIPBUBBLE_API_KEY;

  beforeAll(() => {
    delete process.env.SHIPBUBBLE_API_KEY;
  });

  afterAll(() => {
    if (originalKey) process.env.SHIPBUBBLE_API_KEY = originalKey;
  });

  it("returns free shipping above the threshold", async () => {
    const rates = await getShippingRates({ ...baseInput, subtotal: 60000 });
    expect(rates[0].cost).toBe(0);
  });

  it("uses the state base cost below the threshold", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Lagos" },
    });
    expect(rates.find((r) => r.method === "standard")?.cost).toBe(3000);
  });

  it("applies the weight multiplier", async () => {
    const rates = await getShippingRates({ ...baseInput, weightKg: 4 });
    expect(rates.find((r) => r.method === "standard")?.cost).toBe(4800); // 3000 * 1.6
  });

  it("falls back to the default state rate for unknown states", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Unknown" },
    });
    expect(rates.find((r) => r.method === "standard")?.cost).toBe(5000);
  });

  it("tags results as static", async () => {
    const rates = await getShippingRates(baseInput);
    expect(rates.every((r) => r.source === "static")).toBe(true);
  });
});
