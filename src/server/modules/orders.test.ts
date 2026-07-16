import { PaymentMethod } from "@prisma/client";

const verifyPaystackTransactionMock = jest.fn();
jest.mock("@/lib/webhooks/paystack", () => ({
  verifyPaystackTransaction: (...args: unknown[]) =>
    verifyPaystackTransactionMock(...args),
}));

jest.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/notifications/notify-new-order", () => ({
  notifyNewOrder: jest.fn().mockResolvedValue(undefined),
}));

// checkoutRateLimited/guestCheckoutRateLimited hit a module-level `prisma`
// singleton (not ctx.prisma) — mock it so tests never touch the real DB.
jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

// Shipping cost is separately covered by get-shipping-rate.test.ts — stub
// it to a fixed value here so promo/fee assertions aren't coupled to the
// real state-based rate table.
jest.mock("@/lib/shipping/get-shipping-rate", () => ({
  getShippingRates: jest.fn().mockResolvedValue([{ cost: 0 }]),
}));

import type { Context } from "@/server/context";
import { appRouter } from "@/server/index";

const PRODUCT = {
  id: "prod-1",
  name: "Vitamin C Serum",
  sku: "VCS-1",
  price: 15000,
  track_quantity: true,
  quantity: 10,
};

function buildPrismaMock(
  overrides: { product?: Partial<typeof PRODUCT> } = {},
) {
  const product = { ...PRODUCT, ...overrides.product };

  const tx = {
    address: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "addr-1" }),
    },
    order: {
      create: jest.fn().mockResolvedValue({
        id: "order-1",
        order_number: "ORD-TEST-1",
        email: "customer@example.com",
        first_name: "Jane",
        last_name: "Doe",
        created_at: new Date(),
        tracking_number: null,
        subtotal: product.price,
        shipping_cost: 0,
        tax: 0,
        discount: 0,
        total: product.price,
        items: [
          { product_name: product.name, quantity: 1, price: product.price },
        ],
        shipping_address: null,
      }),
    },
    product: {
      update: jest.fn().mockResolvedValue({}),
    },
  };

  const prisma = {
    user: { findUnique: jest.fn().mockResolvedValue(null) },
    product: { findMany: jest.fn().mockResolvedValue([product]) },
    $transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn(tx)),
  };

  return { prisma, tx, product };
}

function buildContext(
  prisma: unknown,
  role: "ADMIN" | "STAFF" = "ADMIN",
): Context {
  return {
    prisma,
    session: {
      user: { id: "admin-1", role, email: "admin@example.com" },
      expires: new Date(Date.now() + 86_400_000).toISOString(),
    },
    ip: "127.0.0.1",
  } as unknown as Context;
}

const baseAddress = {
  first_name: "Jane",
  last_name: "Doe",
  email: "customer@example.com",
  address_1: "1 Test Street",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
};

describe("adminCreateOrder", () => {
  beforeEach(() => {
    verifyPaystackTransactionMock.mockReset();
  });

  it("rejects non-admin roles", async () => {
    const { prisma } = buildPrismaMock();
    const caller = appRouter.createCaller(buildContext(prisma, "STAFF"));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: { mode: "verify", paystack_reference: "ref-1" },
      }),
    ).rejects.toThrow(/admin/i);
  });

  it("rejects when requested quantity exceeds stock", async () => {
    const { prisma } = buildPrismaMock({ product: { quantity: 1 } });
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 5 }],
        shipping_cost: 0,
        discount: 0,
        payment: { mode: "verify", paystack_reference: "ref-1" },
      }),
    ).rejects.toThrow(/insufficient stock/i);
  });

  it("verify mode: rejects an unsuccessful Paystack transaction", async () => {
    const { prisma } = buildPrismaMock();
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "failed",
      amount: 1500000,
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: { mode: "verify", paystack_reference: "ref-1" },
      }),
    ).rejects.toThrow(/payment not completed/i);
  });

  it("verify mode: rejects when the verified amount does not match the order total", async () => {
    const { prisma } = buildPrismaMock(); // product.price = 15000
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 999900, // 9999 naira — doesn't match the 15000 total
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: { mode: "verify", paystack_reference: "ref-1" },
      }),
    ).rejects.toThrow(/does not match order total/i);
  });

  it("verify mode: rejects the pre-fee amount — the Paystack fee must be included", async () => {
    const { prisma } = buildPrismaMock(); // product.price = 15000
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 1500000, // 15000 naira — missing the ₦325 processing fee
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: { mode: "verify", paystack_reference: "ref-1" },
      }),
    ).rejects.toThrow(/does not match order total/i);
  });

  it("verify mode: creates a COMPLETED order when the verified fee-inclusive amount matches", async () => {
    const { prisma, tx } = buildPrismaMock();
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 1532500, // 15325 naira in kobo — 15000 + ₦325 Paystack fee (1.5% + ₦100)
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    const result = await caller.adminCreateOrder({
      address: baseAddress,
      items: [{ product_id: "prod-1", quantity: 1 }],
      shipping_cost: 0,
      discount: 0,
      payment: { mode: "verify", paystack_reference: "ref-1" },
    });

    expect(result.message).toBe("Order created successfully");
    expect(tx.order.create).toHaveBeenCalledTimes(1);
    const createArgs = tx.order.create.mock.calls[0][0];
    expect(createArgs.data.payment_status).toBe("COMPLETED");
    expect(createArgs.data.payments.create.reference).toBe("ref-1");
    expect(createArgs.data.processing_fee).toBe(325);
    expect(createArgs.data.total).toBe(15325);
    expect(tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "prod-1" },
        data: expect.objectContaining({ quantity: { decrement: 1 } }),
      }),
    );
  });

  it("manual mode: fails validation when the justification is too short", async () => {
    const { prisma } = buildPrismaMock();
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: {
          mode: "manual",
          payment_method: PaymentMethod.BANK_TRANSFER,
          amount: 15000,
          justification: "too short",
        },
      }),
    ).rejects.toThrow();
  });

  it("manual mode: rejects PAYSTACK as the manual payment method", async () => {
    const { prisma } = buildPrismaMock();
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: {
          mode: "manual",
          payment_method: PaymentMethod.PAYSTACK,
          amount: 15000,
          justification: "Customer paid via bank transfer, ref unavailable",
        },
      }),
    ).rejects.toThrow();
  });

  it("manual mode: rejects when the entered amount does not match the order total", async () => {
    const { prisma } = buildPrismaMock();
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: {
          mode: "manual",
          payment_method: PaymentMethod.BANK_TRANSFER,
          amount: 5000,
          justification: "Customer paid via bank transfer, ref unavailable",
        },
      }),
    ).rejects.toThrow(/does not match order total/i);
  });

  it("manual mode: creates a COMPLETED order with a generated reference when none is given", async () => {
    const { prisma, tx } = buildPrismaMock();
    const caller = appRouter.createCaller(buildContext(prisma));

    const result = await caller.adminCreateOrder({
      address: baseAddress,
      items: [{ product_id: "prod-1", quantity: 1 }],
      shipping_cost: 0,
      discount: 0,
      payment: {
        mode: "manual",
        payment_method: PaymentMethod.BANK_TRANSFER,
        amount: 15000,
        justification: "Customer paid via bank transfer, ref unavailable",
      },
    });

    expect(result.message).toBe("Order created successfully");
    const createArgs = tx.order.create.mock.calls[0][0];
    expect(createArgs.data.payment_status).toBe("COMPLETED");
    expect(createArgs.data.payments.create.reference).toMatch(/^MANUAL-/);
    expect(createArgs.data.payments.create.gateway_response.manual).toBe(true);
    // No real Paystack transaction occurred in manual mode — no fee added.
    expect(createArgs.data.processing_fee).toBe(0);
    expect(createArgs.data.total).toBe(15000);
  });

  it("links to an existing user and persists a shipping address when user_id is provided", async () => {
    const { prisma, tx } = buildPrismaMock();
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: "user-1",
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Doe",
      phone: "08000000000",
    });
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 1532500, // 15000 + ₦325 Paystack fee, in kobo
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await caller.adminCreateOrder({
      user_id: "user-1",
      address: baseAddress,
      items: [{ product_id: "prod-1", quantity: 1 }],
      shipping_cost: 0,
      discount: 0,
      payment: { mode: "verify", paystack_reference: "ref-1" },
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(tx.address.create).toHaveBeenCalledTimes(1);
    const createArgs = tx.order.create.mock.calls[0][0];
    expect(createArgs.data.user_id).toBe("user-1");
  });

  it("throws NOT_FOUND when user_id does not match an existing user", async () => {
    const { prisma } = buildPrismaMock();
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.adminCreateOrder({
        user_id: "missing-user",
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        shipping_cost: 0,
        discount: 0,
        payment: { mode: "verify", paystack_reference: "ref-1" },
      }),
    ).rejects.toThrow(/customer not found/i);
  });
});

const PROMOTION = {
  id: "promo-1",
  name: "10% Off",
  code: "SAVE10" as string | null,
  description: null,
  type: "PERCENTAGE",
  value: 10,
  min_order_value: 0,
  max_discount: null,
  status: "ACTIVE",
  target_customers: "ALL",
  start_date: new Date(Date.now() - 86_400_000),
  end_date: new Date(Date.now() + 86_400_000),
  usage_limit: 0,
  usage_count: 0,
  usage_limit_per_user: null,
  show_on_banner: false,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: null,
};

function buildCheckoutPrismaMock(
  overrides: {
    product?: Partial<typeof PRODUCT>;
    promotion?: Partial<typeof PROMOTION> | null;
  } = {},
) {
  const product = { ...PRODUCT, ...overrides.product };
  const promotion =
    overrides.promotion === null
      ? null
      : { ...PROMOTION, ...overrides.promotion };

  const prisma = {
    product: {
      findMany: jest.fn().mockResolvedValue([product]),
      update: jest.fn().mockResolvedValue({}),
    },
    address: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "addr-1" }),
    },
    promotion: {
      findUnique: jest.fn().mockResolvedValue(promotion),
      update: jest.fn().mockResolvedValue({}),
    },
    promotionUsage: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({}),
    },
    cartItem: {
      deleteMany: jest.fn().mockResolvedValue({}),
    },
    order: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({
        id: "order-1",
        order_number: "ORD-TEST-1",
        email: "customer@example.com",
        first_name: "Jane",
        last_name: "Doe",
        created_at: new Date(),
        tracking_number: null,
        subtotal: product.price,
        shipping_cost: 0,
        tax: 0,
        discount: 0,
        processing_fee: 0,
        total: product.price,
        items: [
          { product_name: product.name, quantity: 1, price: product.price },
        ],
        shipping_address: null,
      }),
    },
  };

  return { prisma, product };
}

const basePaymentResponse = {
  paymentStatus: "PAID",
  paymentReference: "ref-1",
  customerEmail: "customer@example.com",
  customerName: "Jane Doe",
};

describe("createOrderWithPayment", () => {
  beforeEach(() => {
    verifyPaystackTransactionMock.mockReset();
  });

  it("rejects a client-reported discount not backed by a valid promotion", async () => {
    // No promo_code/promotion_id sent, but the client claims a discount —
    // the server must ignore totals.discount and recompute its own, so the
    // Paystack-verified amount (matching the inflated claim) won't match.
    const { prisma } = buildCheckoutPrismaMock({ promotion: null });
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: (15000 - 1500 + 325) * 100, // as if the fake discount applied
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.createOrderWithPayment({
        paymentResponse: basePaymentResponse,
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        totals: { subtotal: 15000, shipping: 0, tax: 0, discount: 1500, total: 13500 },
      }),
    ).rejects.toThrow(/payment amount mismatch/i);
  });

  it("ignores an inflated client-reported subtotal when checking min_order_value eligibility", async () => {
    // Real cart (1 unit of PRODUCT) is worth 15000, but the promotion needs
    // a 50000 min order. A client claiming totals.subtotal: 60000 must not
    // unlock it — eligibility is recomputed from verified product prices.
    const { prisma } = buildCheckoutPrismaMock({
      promotion: { code: null, min_order_value: 50000, value: 90 },
    });
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      // As if the fabricated subtotal's 90% discount had applied: 60000 * 0.1 = 6000 + fee
      amount: 620000,
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.createOrderWithPayment({
        paymentResponse: basePaymentResponse,
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        totals: {
          subtotal: 60000,
          shipping: 0,
          tax: 0,
          discount: 54000,
          total: 6000,
        },
        promotion_id: "promo-1",
      }),
    ).rejects.toThrow(/payment amount mismatch/i);
    expect(prisma.promotion.update).not.toHaveBeenCalled();
  });

  it("applies an auto-resolved promotion (by id) and recomputes the discount server-side", async () => {
    // promotion_id resolution only ever trusts codeless (auto-apply) promotions.
    const { prisma } = buildCheckoutPrismaMock({ promotion: { code: null } });
    // subtotal 15000, 10% off = 1500 discount -> preFeeTotal 13500,
    // Paystack fee on 13500 = 13500*1.5%+100 = 302.5, total = 13802.5
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 1380250,
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await caller.createOrderWithPayment({
      paymentResponse: basePaymentResponse,
      address: baseAddress,
      items: [{ product_id: "prod-1", quantity: 1 }],
      totals: { subtotal: 15000, shipping: 0, tax: 0, discount: 0, total: 15000 },
      promotion_id: "promo-1",
    });

    expect(prisma.promotion.findUnique).toHaveBeenCalledWith({
      where: { id: "promo-1" },
    });
    const createArgs = prisma.order.create.mock.calls[0][0];
    expect(createArgs.data.discount).toBe(1500);
    expect(createArgs.data.total).toBe(13802.5);
    expect(prisma.promotion.update).toHaveBeenCalledWith({
      where: { id: "promo-1" },
      data: { usage_count: { increment: 1 } },
    });
    expect(prisma.promotionUsage.create).toHaveBeenCalledWith({
      data: {
        promotion_id: "promo-1",
        user_id: "admin-1",
        discount_amount: 1500,
      },
    });
  });

  it("rejects promotion_id for a coded promotion — id-based resolution only ever trusts codeless auto-apply promotions", async () => {
    // A malicious/guessed promotion_id pointing at a real, coded (non-auto-apply)
    // promotion must NOT be usable to skip typing its code.
    const { prisma } = buildCheckoutPrismaMock({ promotion: { code: "SAVE10" } });
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 1500000, // no discount applied — 15000 naira, no fee waiver bypass either
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildContext(prisma));

    await expect(
      caller.createOrderWithPayment({
        paymentResponse: basePaymentResponse,
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        totals: { subtotal: 15000, shipping: 0, tax: 0, discount: 1500, total: 13500 },
        promotion_id: "promo-1",
      }),
    ).rejects.toThrow(/payment amount mismatch/i);
    expect(prisma.promotion.update).not.toHaveBeenCalled();
    expect(prisma.promotionUsage.create).not.toHaveBeenCalled();
  });
});

describe("createGuestOrderWithPayment", () => {
  beforeEach(() => {
    verifyPaystackTransactionMock.mockReset();
  });

  function buildGuestContext(prisma: unknown): Context {
    return { prisma, session: null, ip: "127.0.0.1" } as unknown as Context;
  }

  it("actually applies a guest-submitted promo_code (previously silently ignored)", async () => {
    const { prisma } = buildCheckoutPrismaMock();
    // Same math as the authenticated case: 15000 - 1500 discount = 13500
    // preFeeTotal, +302.5 fee = 13802.5.
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 1380250,
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildGuestContext(prisma));

    await caller.createGuestOrderWithPayment({
      paymentResponse: basePaymentResponse,
      address: baseAddress,
      items: [{ product_id: "prod-1", quantity: 1 }],
      totals: { subtotal: 15000, shipping: 0, tax: 0, discount: 0, total: 15000 },
      promo_code: "save10",
    });

    expect(prisma.promotion.findUnique).toHaveBeenCalledWith({
      where: { code: "SAVE10" },
    });
    const createArgs = prisma.order.create.mock.calls[0][0];
    expect(createArgs.data.discount).toBe(1500);
    // Guests have no user_id — usage_count still increments (global limit)
    // but no PromotionUsage row is created (user_id is non-nullable).
    expect(prisma.promotion.update).toHaveBeenCalledWith({
      where: { id: "promo-1" },
      data: { usage_count: { increment: 1 } },
    });
    expect(prisma.promotionUsage.create).not.toHaveBeenCalled();
  });

  it("rejects a guest-claimed discount not backed by a valid promotion", async () => {
    const { prisma } = buildCheckoutPrismaMock({ promotion: null });
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: (15000 - 1500 + 325) * 100,
      reference: "ref-1",
    });
    const caller = appRouter.createCaller(buildGuestContext(prisma));

    await expect(
      caller.createGuestOrderWithPayment({
        paymentResponse: basePaymentResponse,
        address: baseAddress,
        items: [{ product_id: "prod-1", quantity: 1 }],
        totals: { subtotal: 15000, shipping: 0, tax: 0, discount: 1500, total: 13500 },
      }),
    ).rejects.toThrow(/payment amount mismatch/i);
  });
});
