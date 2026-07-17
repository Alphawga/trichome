import type { Promotion } from "@prisma/client";
import type { prisma } from "@/lib/prisma";
import { resolveOrderPromotions } from "@/lib/promotions/promotion-eligibility";
import type { Context } from "@/server/context";
import { appRouter } from "@/server/index";

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

function buildPromotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "promo-1",
    name: "Test Promotion",
    code: "TESTCODE",
    description: null,
    type: "PERCENTAGE",
    value: 10 as unknown as Promotion["value"],
    min_order_value: 0 as unknown as Promotion["min_order_value"],
    max_discount: null,
    status: "ACTIVE",
    target_customers: "ALL",
    start_date: yesterday,
    end_date: tomorrow,
    usage_limit: 0,
    usage_count: 0,
    usage_limit_per_user: null,
    show_on_banner: false,
    applicable_state: null,
    applicable_city: null,
    display_location: "CHECKOUT",
    created_at: yesterday,
    updated_at: yesterday,
    created_by: null,
    ...overrides,
  } as Promotion;
}

function buildAdminContext(prisma: unknown): Context {
  return {
    prisma,
    session: {
      user: { id: "admin-1", role: "ADMIN", email: "admin@example.com" },
      expires: new Date(Date.now() + 86_400_000).toISOString(),
    },
    ip: "127.0.0.1",
  } as unknown as Context;
}

function buildAutoApplyPrisma(candidates: Promotion[]) {
  return {
    promotion: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      findMany: jest.fn().mockResolvedValue(candidates),
    },
    promotionUsage: { count: jest.fn().mockResolvedValue(0) },
    order: { count: jest.fn().mockResolvedValue(0) },
  };
}

describe("getAutoApplyPromotions", () => {
  it("returns an empty array when there are no codeless candidates", async () => {
    const prisma = buildAutoApplyPrisma([]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getAutoApplyPromotions({ subtotal: 5000 });

    expect(result).toEqual([]);
    expect(prisma.promotion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ code: null, status: "ACTIVE" }),
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("returns every eligible codeless candidate — all of them stack", async () => {
    const first = buildPromotion({ id: "first", code: null });
    const second = buildPromotion({ id: "second", code: null });
    const prisma = buildAutoApplyPrisma([first, second]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getAutoApplyPromotions({ subtotal: 5000 });

    expect(result.map((r) => r.promotion.id)).toEqual(["first", "second"]);
  });

  it("skips an ineligible candidate while keeping the eligible ones", async () => {
    const ineligible = buildPromotion({
      id: "ineligible",
      code: null,
      usage_limit: 1,
      usage_count: 1,
    });
    const eligible = buildPromotion({ id: "eligible", code: null });
    const prisma = buildAutoApplyPrisma([ineligible, eligible]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getAutoApplyPromotions({ subtotal: 5000 });

    expect(result.map((r) => r.promotion.id)).toEqual(["eligible"]);
  });
});

describe("getActiveProductTagPromotions", () => {
  it("returns a PRODUCT_TAG promotion even when min_order_value is set (no cart context to check it against)", async () => {
    const promotion = buildPromotion({
      code: null,
      display_location: "PRODUCT_TAG",
      min_order_value: 2000 as unknown as Promotion["min_order_value"],
    });
    const prisma = buildAutoApplyPrisma([promotion]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getActiveProductTagPromotions({});

    expect(result.map((p) => p.id)).toEqual(["promo-1"]);
  });

  it("excludes a candidate that fails eligibility for a reason other than min_order_value", async () => {
    const promotion = buildPromotion({
      code: null,
      display_location: "BOTH",
      usage_limit: 1,
      usage_count: 1,
    });
    const prisma = buildAutoApplyPrisma([promotion]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getActiveProductTagPromotions({});

    expect(result).toEqual([]);
  });
});

function buildResolvePrisma(
  candidates: Promotion[],
  codedPromotion?: Promotion | null,
) {
  return {
    promotion: {
      findMany: jest.fn().mockResolvedValue(candidates),
      findUnique: jest.fn().mockResolvedValue(codedPromotion ?? null),
    },
    promotionUsage: { count: jest.fn().mockResolvedValue(0) },
    order: { count: jest.fn().mockResolvedValue(0) },
  } as unknown as typeof prisma;
}

describe("resolveOrderPromotions", () => {
  it("stacks two eligible codeless promotions additively", async () => {
    const a = buildPromotion({
      id: "a",
      code: null,
      type: "PERCENTAGE",
      value: 10 as unknown as Promotion["value"],
    });
    const b = buildPromotion({
      id: "b",
      code: null,
      type: "FIXED_AMOUNT",
      value: 500 as unknown as Promotion["value"],
    });
    const db = buildResolvePrisma([a, b]);

    const result = await resolveOrderPromotions(db, { subtotal: 10000 });

    expect(result.promotions.map((p) => p.promotion.id)).toEqual(["a", "b"]);
    expect(result.totalDiscountAmount).toBe(1500); // 1000 (10%) + 500
    expect(result.isFreeShipping).toBe(false);
  });

  it("adds a manually entered code on top of the automatic stack", async () => {
    const auto = buildPromotion({
      id: "auto",
      code: null,
      type: "FIXED_AMOUNT",
      value: 500 as unknown as Promotion["value"],
    });
    const coded = buildPromotion({
      id: "coded",
      code: "SAVE10",
      type: "PERCENTAGE",
      value: 10 as unknown as Promotion["value"],
    });
    const db = buildResolvePrisma([auto], coded);

    const result = await resolveOrderPromotions(db, {
      subtotal: 10000,
      promoCode: "SAVE10",
    });

    expect(result.promotions.map((p) => p.promotion.id)).toEqual([
      "auto",
      "coded",
    ]);
    expect(result.totalDiscountAmount).toBe(1500); // 500 + 1000 (10%)
  });

  it("caps the combined discount at the subtotal", async () => {
    const a = buildPromotion({
      id: "a",
      code: null,
      type: "FIXED_AMOUNT",
      value: 8000 as unknown as Promotion["value"],
    });
    const b = buildPromotion({
      id: "b",
      code: null,
      type: "FIXED_AMOUNT",
      value: 8000 as unknown as Promotion["value"],
    });
    const db = buildResolvePrisma([a, b]);

    const result = await resolveOrderPromotions(db, { subtotal: 10000 });

    expect(result.totalDiscountAmount).toBe(10000);
  });

  it("ORs free shipping across a mixed stack", async () => {
    const percentageOff = buildPromotion({
      id: "percentage",
      code: null,
      type: "PERCENTAGE",
      value: 5 as unknown as Promotion["value"],
    });
    const freeShipping = buildPromotion({
      id: "shipping",
      code: null,
      type: "FREE_SHIPPING",
    });
    const db = buildResolvePrisma([percentageOff, freeShipping]);

    const result = await resolveOrderPromotions(db, { subtotal: 10000 });

    expect(result.isFreeShipping).toBe(true);
  });

  it("excludes a location-mismatched codeless promotion from the stack", async () => {
    const scoped = buildPromotion({
      id: "scoped",
      code: null,
      applicable_state: "Ondo",
      applicable_city: "Akure",
      type: "FREE_SHIPPING",
    });
    const storeWide = buildPromotion({
      id: "storewide",
      code: null,
      type: "FIXED_AMOUNT",
      value: 500 as unknown as Promotion["value"],
    });
    const db = buildResolvePrisma([scoped, storeWide]);

    const result = await resolveOrderPromotions(db, {
      subtotal: 10000,
      state: "Lagos",
      city: "Lagos",
    });

    expect(result.promotions.map((p) => p.promotion.id)).toEqual([
      "storewide",
    ]);
    expect(result.isFreeShipping).toBe(false);
  });
});
