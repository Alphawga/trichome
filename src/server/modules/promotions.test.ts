import type { Promotion } from "@prisma/client";
import type { prisma } from "@/lib/prisma";
import {
  calculatePromotionDiscount,
  checkPromotionEligibility,
} from "@/lib/promotions/promotion-eligibility";
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
    created_at: yesterday,
    updated_at: yesterday,
    created_by: null,
    ...overrides,
  } as Promotion;
}

function buildDb(
  overrides: { promotionUsageCount?: number; orderCount?: number } = {},
) {
  const db = {
    promotionUsage: {
      count: jest.fn().mockResolvedValue(overrides.promotionUsageCount ?? 0),
    },
    order: {
      count: jest.fn().mockResolvedValue(overrides.orderCount ?? 0),
    },
  };
  return db as unknown as typeof prisma & typeof db;
}

describe("calculatePromotionDiscount", () => {
  it("computes a percentage discount", () => {
    const promotion = buildPromotion({
      type: "PERCENTAGE",
      value: 10 as unknown as Promotion["value"],
    });
    const result = calculatePromotionDiscount(promotion, 10000);
    expect(result.discountAmount).toBe(1000);
    expect(result.isFreeShipping).toBe(false);
  });

  it("caps a percentage discount at max_discount", () => {
    const promotion = buildPromotion({
      type: "PERCENTAGE",
      value: 50 as unknown as Promotion["value"],
      max_discount: 2000 as unknown as Promotion["max_discount"],
    });
    const result = calculatePromotionDiscount(promotion, 10000);
    expect(result.discountAmount).toBe(2000);
  });

  it("applies a fixed-amount discount", () => {
    const promotion = buildPromotion({
      type: "FIXED_AMOUNT",
      value: 1500 as unknown as Promotion["value"],
    });
    const result = calculatePromotionDiscount(promotion, 10000);
    expect(result.discountAmount).toBe(1500);
  });

  it("caps a fixed-amount discount at the subtotal", () => {
    const promotion = buildPromotion({
      type: "FIXED_AMOUNT",
      value: 50000 as unknown as Promotion["value"],
    });
    const result = calculatePromotionDiscount(promotion, 10000);
    expect(result.discountAmount).toBe(10000);
  });

  it("returns zero discount and flags free shipping for FREE_SHIPPING type", () => {
    const promotion = buildPromotion({ type: "FREE_SHIPPING" });
    const result = calculatePromotionDiscount(promotion, 10000);
    expect(result.discountAmount).toBe(0);
    expect(result.isFreeShipping).toBe(true);
  });
});

describe("checkPromotionEligibility", () => {
  it("rejects an inactive promotion", async () => {
    const db = buildDb();
    const promotion = buildPromotion({ status: "INACTIVE" });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
    });
    expect(result.eligible).toBe(false);
  });

  it("rejects a promotion before its start date", async () => {
    const db = buildDb();
    const promotion = buildPromotion({
      start_date: tomorrow,
      end_date: new Date(tomorrow.getTime() + 86_400_000),
    });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
    });
    expect(result.eligible).toBe(false);
  });

  it("rejects a promotion past its end date", async () => {
    const db = buildDb();
    const promotion = buildPromotion({
      start_date: new Date(yesterday.getTime() - 86_400_000),
      end_date: yesterday,
    });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
    });
    expect(result.eligible).toBe(false);
  });

  it("rejects when subtotal is below min_order_value", async () => {
    const db = buildDb();
    const promotion = buildPromotion({
      min_order_value: 10000 as unknown as Promotion["min_order_value"],
    });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
    });
    expect(result.eligible).toBe(false);
  });

  it("rejects when the global usage limit is reached", async () => {
    const db = buildDb();
    const promotion = buildPromotion({ usage_limit: 5, usage_count: 5 });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
    });
    expect(result.eligible).toBe(false);
  });

  it("rejects when the per-user usage limit is reached", async () => {
    const db = buildDb({ promotionUsageCount: 2 });
    const promotion = buildPromotion({ usage_limit_per_user: 2 });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
      userId: "user-1",
    });
    expect(result.eligible).toBe(false);
    expect(db.promotionUsage.count).toHaveBeenCalledWith({
      where: { promotion_id: "promo-1", user_id: "user-1" },
    });
  });

  it("skips the per-user usage check for guests (no userId)", async () => {
    const db = buildDb({ promotionUsageCount: 99 });
    const promotion = buildPromotion({ usage_limit_per_user: 1 });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
    });
    expect(result.eligible).toBe(true);
    expect(db.promotionUsage.count).not.toHaveBeenCalled();
  });

  it("rejects NEW_CUSTOMERS-targeted promotions for users with prior orders", async () => {
    const db = buildDb({ orderCount: 1 });
    const promotion = buildPromotion({ target_customers: "NEW_CUSTOMERS" });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
      userId: "user-1",
    });
    expect(result.eligible).toBe(false);
  });

  it("allows NEW_CUSTOMERS-targeted promotions for users with no prior orders", async () => {
    const db = buildDb({ orderCount: 0 });
    const promotion = buildPromotion({ target_customers: "NEW_CUSTOMERS" });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
      userId: "user-1",
    });
    expect(result.eligible).toBe(true);
  });

  it("skips the NEW_CUSTOMERS check for guests (no userId)", async () => {
    const db = buildDb();
    const promotion = buildPromotion({ target_customers: "NEW_CUSTOMERS" });
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
    });
    expect(result.eligible).toBe(true);
    expect(db.order.count).not.toHaveBeenCalled();
  });

  it("is eligible when every check passes", async () => {
    const db = buildDb();
    const promotion = buildPromotion();
    const result = await checkPromotionEligibility(db, promotion, {
      subtotal: 5000,
      userId: "user-1",
    });
    expect(result.eligible).toBe(true);
  });
});

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

const baseCreateInput = {
  name: "Store-wide sale",
  type: "PERCENTAGE" as const,
  value: 10,
  start_date: yesterday.toISOString(),
  end_date: tomorrow.toISOString(),
};

describe("createPromotion", () => {
  it("creates a codeless promotion without a duplicate-code lookup", async () => {
    const findUnique = jest.fn();
    const create = jest.fn().mockResolvedValue(buildPromotion({ code: null }));
    const prisma = { promotion: { findUnique, create } };
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.createPromotion(baseCreateInput);

    expect(findUnique).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: undefined }),
      }),
    );
    expect(result.message).toBe("Promotion created successfully");
  });

  it("rejects a duplicate code", async () => {
    const findUnique = jest.fn().mockResolvedValue(buildPromotion());
    const create = jest.fn();
    const prisma = { promotion: { findUnique, create } };
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    await expect(
      caller.createPromotion({ ...baseCreateInput, code: "SUMMER20" }),
    ).rejects.toThrow(/already exists/i);
    expect(create).not.toHaveBeenCalled();
  });

  it("creates a promotion with a unique code", async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const create = jest
      .fn()
      .mockResolvedValue(buildPromotion({ code: "SUMMER20" }));
    const prisma = { promotion: { findUnique, create } };
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.createPromotion({
      ...baseCreateInput,
      code: "summer20",
    });

    expect(findUnique).toHaveBeenCalledWith({ where: { code: "SUMMER20" } });
    expect(result.message).toBe("Promotion created successfully");
  });
});

describe("updatePromotion", () => {
  it("clears an existing code back to null when explicitly sent", async () => {
    const findFirst = jest.fn();
    const update = jest.fn().mockResolvedValue(buildPromotion({ code: null }));
    const prisma = { promotion: { findFirst, update } };
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    await caller.updatePromotion({ id: "promo-1", code: null });

    expect(findFirst).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: null }),
      }),
    );
  });

  it("leaves the code unchanged when omitted", async () => {
    const findFirst = jest.fn();
    const update = jest.fn().mockResolvedValue(buildPromotion());
    const prisma = { promotion: { findFirst, update } };
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    await caller.updatePromotion({ id: "promo-1", name: "Renamed" });

    expect(findFirst).not.toHaveBeenCalled();
    const updateArgs = update.mock.calls[0][0];
    expect("code" in updateArgs.data).toBe(false);
  });

  it("rejects updating to a code already used by another promotion", async () => {
    const findFirst = jest
      .fn()
      .mockResolvedValue(buildPromotion({ id: "other-promo" }));
    const update = jest.fn();
    const prisma = { promotion: { findFirst, update } };
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    await expect(
      caller.updatePromotion({ id: "promo-1", code: "TAKEN" }),
    ).rejects.toThrow(/already exists/i);
    expect(update).not.toHaveBeenCalled();
  });
});

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

describe("getAutoApplyPromotion", () => {
  it("returns null when there are no codeless candidates", async () => {
    const prisma = buildAutoApplyPrisma([]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getAutoApplyPromotion({ subtotal: 5000 });

    expect(result).toBeNull();
    expect(prisma.promotion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ code: null, status: "ACTIVE" }),
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("returns the first eligible candidate in newest-first order", async () => {
    const newest = buildPromotion({ id: "newest", code: null });
    const prisma = buildAutoApplyPrisma([newest]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getAutoApplyPromotion({ subtotal: 5000 });

    expect(result?.promotion.id).toBe("newest");
  });

  it("skips an ineligible candidate and falls through to the next one", async () => {
    const ineligible = buildPromotion({
      id: "ineligible",
      code: null,
      usage_limit: 1,
      usage_count: 1,
    });
    const eligible = buildPromotion({ id: "eligible", code: null });
    const prisma = buildAutoApplyPrisma([ineligible, eligible]);
    const caller = appRouter.createCaller(buildAdminContext(prisma));

    const result = await caller.getAutoApplyPromotion({ subtotal: 5000 });

    expect(result?.promotion.id).toBe("eligible");
  });
});
