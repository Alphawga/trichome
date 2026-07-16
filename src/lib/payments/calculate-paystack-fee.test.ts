import {
  calculatePaystackFee,
  PAYSTACK_FEE_CAP,
  PAYSTACK_FLAT_FEE,
  PAYSTACK_FLAT_FEE_WAIVER_THRESHOLD,
  PAYSTACK_PERCENTAGE_FEE,
} from "./calculate-paystack-fee";

describe("calculatePaystackFee", () => {
  it("returns 0 for a zero amount", () => {
    expect(calculatePaystackFee(0)).toBe(0);
  });

  it("returns 0 for a negative amount", () => {
    expect(calculatePaystackFee(-500)).toBe(0);
  });

  it("charges percentage only, no flat fee, below the waiver threshold", () => {
    // 1000 * 1.5% = 15, no flat fee since 1000 < 2500
    expect(calculatePaystackFee(1000)).toBe(15);
  });

  it("still waives the flat fee just under the threshold", () => {
    const amount = PAYSTACK_FLAT_FEE_WAIVER_THRESHOLD - 0.01;
    const expected = Math.round(amount * PAYSTACK_PERCENTAGE_FEE * 100) / 100;
    expect(calculatePaystackFee(amount)).toBe(expected);
  });

  it("applies the flat fee at exactly the waiver threshold", () => {
    const amount = PAYSTACK_FLAT_FEE_WAIVER_THRESHOLD;
    const expected =
      Math.round((amount * PAYSTACK_PERCENTAGE_FEE + PAYSTACK_FLAT_FEE) * 100) /
      100;
    expect(calculatePaystackFee(amount)).toBe(expected);
  });

  it("applies percentage + flat fee for a typical mid-size order, uncapped", () => {
    // 50000 * 1.5% + 100 = 850, under the 2000 cap
    expect(calculatePaystackFee(50000)).toBe(850);
  });

  it("caps the fee at the maximum for large orders", () => {
    // 150000 * 1.5% + 100 = 2350, which exceeds the 2000 cap
    expect(calculatePaystackFee(150000)).toBe(PAYSTACK_FEE_CAP);
  });

  it("caps the fee at exactly the boundary amount", () => {
    // Find the amount where uncapped fee == cap: (cap - flat) / pct
    const boundaryAmount =
      (PAYSTACK_FEE_CAP - PAYSTACK_FLAT_FEE) / PAYSTACK_PERCENTAGE_FEE;
    expect(calculatePaystackFee(boundaryAmount)).toBe(PAYSTACK_FEE_CAP);
    expect(calculatePaystackFee(boundaryAmount + 1000)).toBe(PAYSTACK_FEE_CAP);
  });
});
