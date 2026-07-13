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

  it("verify mode: creates a COMPLETED order when the verified amount matches", async () => {
    const { prisma, tx } = buildPrismaMock();
    verifyPaystackTransactionMock.mockResolvedValue({
      status: "success",
      amount: 1500000, // 15000 naira in kobo
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
      amount: 1500000,
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
