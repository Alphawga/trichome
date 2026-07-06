import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states";
import { DELIVERY_DAYS, STATE_SHIPPING_COSTS } from "./calculate-shipping";
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

describe("NIGERIAN_STATES / shipping-rate table coupling", () => {
  const dropdownValues = new Set(NIGERIAN_STATES.map((s) => s.value));

  it("has a dropdown entry for every state with an explicit shipping cost", () => {
    for (const key of Object.keys(STATE_SHIPPING_COSTS)) {
      if (key === "default") continue;
      expect(dropdownValues.has(key)).toBe(true);
    }
  });

  it("has a dropdown entry for every state with explicit delivery days", () => {
    for (const key of Object.keys(DELIVERY_DAYS)) {
      if (key === "default") continue;
      expect(dropdownValues.has(key)).toBe(true);
    }
  });
});

describe("getShippingRates (static fallback, no TERMINAL_SECRET_KEY)", () => {
  const originalKey = process.env.TERMINAL_SECRET_KEY;

  beforeAll(() => {
    delete process.env.TERMINAL_SECRET_KEY;
  });

  afterAll(() => {
    if (originalKey) process.env.TERMINAL_SECRET_KEY = originalKey;
  });

  it("returns free shipping for Akure orders at or above ₦30,000", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Ondo", city: "Akure" },
      subtotal: 30000,
    });
    expect(rates[0].cost).toBe(0);
  });

  it("matches Akure case-insensitively and trimmed", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Ondo", city: " AKURE " },
      subtotal: 30000,
    });
    expect(rates[0].cost).toBe(0);
  });

  it("does not give free shipping to Akure orders below ₦30,000", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Ondo", city: "Akure" },
      subtotal: 29999,
    });
    expect(rates[0].cost).toBe(4500);
  });

  it("no longer gives free shipping for large non-Akure orders", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Lagos" },
      subtotal: 100000,
    });
    expect(rates[0].cost).toBe(3000);
  });

  it("uses the state base cost below the threshold", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Lagos" },
    });
    expect(rates[0].cost).toBe(3000);
  });

  it("matches a state name with a trailing 'state' suffix", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Oyo state" },
    });
    expect(rates[0].cost).toBe(4000);
  });

  it("matches a state name case-insensitively and trimmed", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: " OYO STATE " },
    });
    expect(rates[0].cost).toBe(4000);
  });

  it("matches a state name with no suffix", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "oyo" },
    });
    expect(rates[0].cost).toBe(4000);
  });

  it("applies the weight multiplier", async () => {
    const rates = await getShippingRates({ ...baseInput, weightKg: 4 });
    expect(rates[0].cost).toBe(4800); // 3000 * 1.6
  });

  it("falls back to the default state rate for unknown states", async () => {
    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Unknown" },
    });
    expect(rates[0].cost).toBe(5000);
  });

  it("tags results as static", async () => {
    const rates = await getShippingRates(baseInput);
    expect(rates.every((r) => r.source === "static")).toBe(true);
  });
});

describe("getShippingRates (TERMINAL_SECRET_KEY set)", () => {
  const originalKey = process.env.TERMINAL_SECRET_KEY;

  beforeAll(() => {
    process.env.TERMINAL_SECRET_KEY = "test-key";
  });

  afterAll(() => {
    if (originalKey) {
      process.env.TERMINAL_SECRET_KEY = originalKey;
    } else {
      delete process.env.TERMINAL_SECRET_KEY;
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("skips the live call and logs a distinct incomplete-address warning when contact details are missing", async () => {
    const fetchSpy = jest.spyOn(global, "fetch");
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const rates = await getShippingRates({
      ...baseInput,
      destination: { state: "Lagos", city: "Ikeja" },
    });

    expect(rates[0].source).toBe("static");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("not a Terminal Africa outage"),
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("falls back to static rates and logs a generic operational error when the live call fails", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("network down"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const rates = await getShippingRates({
      ...baseInput,
      destination: {
        state: "Lagos",
        city: "Ikeja",
        addressLine: "1 Test Street",
        contactName: "Test User",
        contactEmail: "test@example.com",
        contactPhone: "08000000000",
      },
    });

    expect(rates[0].source).toBe("static");
    expect(fetchSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "Terminal Africa rate lookup failed, falling back to static rates:",
      expect.any(Error),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns the cheapest carrier's rate on a successful live quote", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        data: [
          {
            amount: 2500,
            carrier_name: "Expensive Carrier",
            delivery_eta: 1440,
          },
          { amount: 1500, carrier_name: "Cheap Carrier", delivery_eta: 2880 },
        ],
      }),
    } as Response);

    const rates = await getShippingRates({
      ...baseInput,
      destination: {
        state: "Lagos",
        city: "Ikeja",
        addressLine: "2 Test Avenue",
        contactName: "Test User",
        contactEmail: "test@example.com",
        contactPhone: "08000000000",
      },
    });

    expect(rates[0].source).toBe("live");
    expect(rates[0].courier).toBe("Cheap Carrier");
    expect(rates[0].cost).toBe(1500);
    expect(rates[0].estimatedDays).toBe(2); // 2880 minutes -> 2 days
  });
});
