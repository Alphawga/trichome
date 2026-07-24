"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  clearPersistedPromoCode,
  getPersistedPromoCode,
  setPersistedPromoCode,
} from "@/utils/local-promo";
import { trpc } from "@/utils/trpc";

interface UsePromoCodeOptions {
  subtotal: number;
  userId?: string;
  state?: string;
  city?: string;
  /** Persist an applied code to localStorage so a later page (checkout) can auto-apply it. */
  persistOnApply?: boolean;
  /** Read a persisted code from localStorage and apply it once, as soon as subtotal is known. */
  autoApplyFromStorage?: boolean;
}

/**
 * Store-wide (codeless) promotions auto-apply and stack together; a manually
 * entered code adds on top of that set. Shared between the cart page and
 * checkout so a code applied on cart can carry over (persistOnApply +
 * autoApplyFromStorage) instead of being re-typed.
 */
export function usePromoCode({
  subtotal,
  userId,
  state,
  city,
  persistOnApply = false,
  autoApplyFromStorage = false,
}: UsePromoCodeOptions) {
  const utils = trpc.useUtils();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discount: number;
    isFreeShipping: boolean;
  } | null>(null);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  // Every eligible codeless promotion stacks together automatically. A
  // manually entered code (below) adds on top of this set rather than
  // replacing it. Not gated on having a full address yet — a location-scoped
  // promotion just won't be eligible until the destination is known;
  // store-wide ones auto-apply immediately.
  const autoApplyPromotionsQuery = trpc.getAutoApplyPromotions.useQuery(
    { subtotal, userId, state, city },
    { enabled: subtotal > 0 },
  );

  const autoAppliedPromos = useMemo(
    () =>
      (autoApplyPromotionsQuery.data ?? []).map((entry) => ({
        promotionId: entry.promotion.id,
        name: entry.promotion.name,
        discount: entry.discountAmount,
        isFreeShipping: entry.isFreeShipping,
      })),
    [autoApplyPromotionsQuery.data],
  );

  const isFreeShipping =
    appliedPromoCode?.isFreeShipping ||
    autoAppliedPromos.some((p) => p.isFreeShipping);
  const discount = Math.min(
    autoAppliedPromos.reduce((sum, p) => sum + p.discount, 0) +
      (appliedPromoCode?.discount ?? 0),
    subtotal,
  );

  // Uses utils.validatePromoCode.fetch (a one-off imperative call) rather
  // than a useQuery bound to `promoCode` state — the auto-apply-from-storage
  // path below needs to validate a code the instant it reads it, before a
  // state update setting `promoCode` would have re-rendered.
  const applyPromoCode = useCallback(
    async (codeOverride?: string) => {
      const code = (codeOverride ?? promoCode).trim();
      if (!code) {
        setPromoCodeError("Please enter a promo code");
        return;
      }

      setIsApplyingCode(true);
      try {
        const result = await utils.validatePromoCode.fetch({
          code,
          subtotal,
          userId,
          state,
          city,
        });

        setAppliedPromoCode({
          code,
          discount: result.discountAmount,
          isFreeShipping: result.isFreeShipping,
        });
        setPromoCodeError(null);
        toast.success("Promo code applied successfully!");
        if (persistOnApply) {
          setPersistedPromoCode(code);
        }
      } catch (error) {
        setAppliedPromoCode(null);
        setPromoCodeError(
          error instanceof Error ? error.message : "Invalid promo code",
        );
      } finally {
        setIsApplyingCode(false);
      }
    },
    [promoCode, subtotal, userId, state, city, persistOnApply, utils],
  );

  const removePromoCode = useCallback(() => {
    setAppliedPromoCode(null);
    setPromoCode("");
    setPromoCodeError(null);
    if (persistOnApply) {
      clearPersistedPromoCode();
    }
  }, [persistOnApply]);

  // Auto-apply a promo code persisted from an earlier page (cart), once
  // subtotal is known. Attempted at most once per mount, regardless of outcome.
  const autoApplyAttempted = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: applyPromoCode is recreated every render (depends on promoCode) and would re-run this effect on every keystroke — the ref guard below already ensures a single attempt.
  useEffect(() => {
    if (!autoApplyFromStorage || autoApplyAttempted.current || subtotal <= 0) {
      return;
    }

    const persistedCode = getPersistedPromoCode();
    autoApplyAttempted.current = true;
    if (!persistedCode) return;

    setPromoCode(persistedCode);
    applyPromoCode(persistedCode).finally(() => {
      clearPersistedPromoCode();
    });
  }, [autoApplyFromStorage, subtotal]);

  return {
    promoCode,
    setPromoCode,
    appliedPromoCode,
    promoCodeError,
    setPromoCodeError,
    autoAppliedPromos,
    discount,
    isFreeShipping,
    isApplyingCode,
    isAutoApplyLoading: autoApplyPromotionsQuery.isFetching,
    applyPromoCode,
    removePromoCode,
  };
}
