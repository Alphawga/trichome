/**
 * Paystack Fee Calculation
 *
 * Computes Paystack's Nigeria local-card transaction fee so it can be added
 * on top of the order total, passing the cost through to the customer
 * instead of the merchant absorbing it.
 */

/** Paystack's percentage cut on local transactions */
export const PAYSTACK_PERCENTAGE_FEE = 0.015;

/** Flat fee added on top of the percentage cut (waived below the threshold) */
export const PAYSTACK_FLAT_FEE = 100;

/** The flat fee is waived for transactions strictly below this amount */
export const PAYSTACK_FLAT_FEE_WAIVER_THRESHOLD = 2500;

/** Paystack caps its total fee at this amount regardless of order size */
export const PAYSTACK_FEE_CAP = 2000;

/**
 * Calculates the Paystack fee for a given pre-fee amount, mirroring
 * Paystack's actual Nigeria local-card pricing: 1.5% + ₦100 (the ₦100 is
 * waived below ₦2,500), capped at ₦2,000 total.
 */
export function calculatePaystackFee(amount: number): number {
  if (amount <= 0) return 0;

  const flatFee =
    amount >= PAYSTACK_FLAT_FEE_WAIVER_THRESHOLD ? PAYSTACK_FLAT_FEE : 0;
  const fee = amount * PAYSTACK_PERCENTAGE_FEE + flatFee;
  const cappedFee = Math.min(fee, PAYSTACK_FEE_CAP);

  return Math.round(cappedFee * 100) / 100;
}
