import type { Prisma } from "@prisma/client";
import {
  Currency,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, staffProcedure } from "../trpc";

// Get user's orders
export const getMyOrders = protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit } = input;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      ctx.prisma.order.findMany({
        where: { user_id: ctx.user.id },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    where: { is_primary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          shipping_address: true,
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.order.count({ where: { user_id: ctx.user.id } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get all orders (staff)
export const getOrders = staffProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      status: z.nativeEnum(OrderStatus).optional(),
      payment_status: z.nativeEnum(PaymentStatus).optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { page, limit, status, payment_status, search } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(payment_status && { payment_status }),
      ...(search && {
        OR: [
          { order_number: { contains: search } },
          { email: { contains: search, mode: "insensitive" as const } },
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      ctx.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    where: { is_primary: true },
                    take: 1,
                  },
                },
              },
            },
          },
          shipping_address: true,
        },
        orderBy: { created_at: "desc" },
      }),
      ctx.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

// Get order by ID
export const getOrderById = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
        shipping_address: true,
        payments: true,
        status_history: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    // Check if user has access to this order
    if (
      order.user_id !== ctx.user.id &&
      ctx.user.role !== "ADMIN" &&
      ctx.user.role !== "STAFF"
    ) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    return order;
  });

// Get order by order number
export const getOrderByNumber = protectedProcedure
  .input(z.object({ orderNumber: z.string() }))
  .query(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { order_number: input.orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
        shipping_address: true,
        payments: true,
        status_history: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    return order;
  });

// Create order
export const createOrder = protectedProcedure
  .input(
    z.object({
      email: z.email(),
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      phone: z.string().optional(),
      payment_method: z.nativeEnum(PaymentMethod),
      currency: z.nativeEnum(Currency).default("NGN"),
      shipping_address_id: z.string(),
      notes: z.string().optional(),
      items: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().int().min(1),
        }),
      ),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { items: orderItems, ...orderData } = input;

    // Validate products and calculate totals
    const products = await ctx.prisma.product.findMany({
      where: { id: { in: orderItems.map((item) => item.product_id) } },
    });

    if (products.length !== orderItems.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Some products not found",
      });
    }

    // Check stock availability
    for (const orderItem of orderItems) {
      const product = products.find((p) => p.id === orderItem.product_id);
      if (!product) continue;

      if (product.track_quantity && product.quantity < orderItem.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product not found for item ${item.product_id}`,
        });
      }
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const shipping_cost = 0; // Calculate based on your logic
    const tax = 0; // Calculate based on your logic
    const discount = 0;
    const total = subtotal + shipping_cost + tax - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await ctx.prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: ctx.user.id,
        email: orderData.email,
        first_name: orderData.first_name,
        last_name: orderData.last_name,
        phone: orderData.phone,
        payment_method: orderData.payment_method,
        currency: orderData.currency,
        shipping_address_id: orderData.shipping_address_id,
        notes: orderData.notes,
        subtotal,
        shipping_cost,
        tax,
        discount,
        total,
        items: {
          create: orderItems.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
            if (!product) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Product not found for item ${item.product_id}`,
              });
            }
            return {
              product_id: item.product_id,
              product_name: product.name,
              product_sku: product.sku,
              price: product.price,
              quantity: item.quantity,
              total: Number(product.price) * item.quantity,
            };
          }),
        },
        status_history: {
          create: {
            status: "PENDING",
            notes: "Order created",
            created_by: ctx.user.id,
          },
        },
      },
      include: {
        items: true,
        shipping_address: true,
      },
    });

    // Clear cart after order
    await ctx.prisma.cartItem.deleteMany({
      where: { user_id: ctx.user.id },
    });

    // Update product quantities
    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        continue;
      }
      if (product.track_quantity) {
        await ctx.prisma.product.update({
          where: { id: item.product_id },
          data: {
            quantity: { decrement: item.quantity },
            reserved_quantity: { increment: item.quantity },
            sale_count: { increment: item.quantity },
          },
        });
      }
    }

    return { order, message: "Order created successfully" };
  });

// Create order with payment (after payment success)
export const createOrderWithPayment = protectedProcedure
  .input(
    z.object({
      // Payment response from Monnify
      paymentResponse: z.object({
        paymentStatus: z.string(),
        transactionReference: z.string().optional(),
        paymentReference: z.string(),
        amountPaid: z.string().optional(),
        paymentDescription: z.string().optional(),
        customerEmail: z.string().email(),
        customerName: z.string(),
      }),
      // Address data
      address: z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        address_1: z.string().min(1),
        address_2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().default("Nigeria"),
      }),
      // Order items from cart
      items: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().int().min(1),
        }),
      ),
      // Calculated totals
      totals: z.object({
        subtotal: z.number(),
        shipping: z.number(),
        tax: z.number(),
        discount: z.number().default(0),
        total: z.number(),
      }),
      // Payment method (defaults to WALLET for Monnify)
      payment_method: z.nativeEnum(PaymentMethod).default("WALLET"),
      currency: z.nativeEnum(Currency).default("NGN"),
      notes: z.string().optional(),
      // Optional promo code
      promo_code: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const {
      paymentResponse,
      address,
      items: orderItems,
      totals,
      payment_method,
      currency,
      notes,
      promo_code: _promo_code,
    } = input;

    // Validate payment status
    if (paymentResponse.paymentStatus !== "PAID") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Payment not completed. Status: ${paymentResponse.paymentStatus}`,
      });
    }

    // Validate products and check stock
    const products = await ctx.prisma.product.findMany({
      where: { id: { in: orderItems.map((item) => item.product_id) } },
    });

    if (products.length !== orderItems.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Some products not found",
      });
    }

    // Check stock availability
    for (const orderItem of orderItems) {
      const product = products.find((p) => p.id === orderItem.product_id);
      if (!product) continue;

      if (product.track_quantity && product.quantity < orderItem.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // Validate payment amount matches order total
    const expectedTotal = totals.total;
    const paidAmount = paymentResponse.amountPaid
      ? parseFloat(paymentResponse.amountPaid)
      : expectedTotal;

    // Allow small floating point differences (e.g., 0.01)
    if (Math.abs(paidAmount - expectedTotal) > 0.01) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Payment amount mismatch. Expected: ${expectedTotal}, Received: ${paidAmount}`,
      });
    }

    // Create or get shipping address
    let shippingAddress: { id: string };
    const existingAddress = await ctx.prisma.address.findFirst({
      where: {
        user_id: ctx.user.id,
        address_1: address.address_1,
        city: address.city,
        postal_code: address.postal_code || "",
      },
    });

    if (existingAddress) {
      shippingAddress = existingAddress;
    } else {
      shippingAddress = await ctx.prisma.address.create({
        data: {
          user_id: ctx.user.id,
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: address.address_1,
          address_2: address.address_2,
          city: address.city,
          state: address.state || "",
          postal_code: address.postal_code || "",
          country: address.country,
          phone: address.phone,
          is_default: false, // Don't set as default automatically
        },
      });
    }

    // Handle promo code if provided
    let _promotionId: string | undefined;
    if (_promo_code) {
      const promotion = await ctx.prisma.promotion.findUnique({
        where: { code: _promo_code.toUpperCase() },
      });

      if (promotion) {
        // Validate promo code again (server-side validation)
        const now = new Date();
        if (
          promotion.status === "ACTIVE" &&
          now >= promotion.start_date &&
          now <= promotion.end_date &&
          totals.subtotal >= Number(promotion.min_order_value)
        ) {
          _promotionId = promotion.id;

          // Increment usage count
          await ctx.prisma.promotion.update({
            where: { id: promotion.id },
            data: { usage_count: { increment: 1 } },
          });

          // Record usage
          await ctx.prisma.promotionUsage.create({
            data: {
              promotion_id: promotion.id,
              user_id: ctx.user.id,
              discount_amount: totals.discount,
            },
          });
        }
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with payment
    const order = await ctx.prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: ctx.user.id,
        email: address.email,
        first_name: address.first_name,
        last_name: address.last_name,
        phone: address.phone,
        payment_method,
        currency,
        shipping_address_id: shippingAddress.id,
        notes,
        subtotal: totals.subtotal,
        shipping_cost: totals.shipping,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        payment_status: "COMPLETED", // Payment is already completed
        status: "PENDING", // Order status starts as PENDING
        items: {
          create: orderItems.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
            if (!product) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Product not found for item ${item.product_id}`,
              });
            }
            return {
              product_id: item.product_id,
              product_name: product.name,
              product_sku: product.sku,
              price: product.price,
              quantity: item.quantity,
              total: Number(product.price) * item.quantity,
            };
          }),
        },
        payments: {
          create: {
            payment_method,
            status: "COMPLETED",
            amount: totals.total,
            currency,
            transaction_id: paymentResponse.transactionReference || undefined,
            reference: paymentResponse.paymentReference,
            gateway_response: paymentResponse as Prisma.InputJsonValue, // Store full payment response
            processed_at: new Date(),
          },
        },
        status_history: {
          create: [
            {
              status: "PENDING",
              notes: "Order created",
              created_by: ctx.user.id,
            },
            {
              status: "PENDING",
              notes: "Payment completed",
              created_by: ctx.user.id,
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
        shipping_address: true,
        payments: true,
      },
    });

    // Clear cart after order
    await ctx.prisma.cartItem.deleteMany({
      where: { user_id: ctx.user.id },
    });

    // Update product quantities
    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;
      if (product.track_quantity) {
        await ctx.prisma.product.update({
          where: { id: item.product_id },
          data: {
            quantity: { decrement: item.quantity },
            reserved_quantity: { increment: item.quantity },
            sale_count: { increment: item.quantity },
          },
        });
      }
    }

    // Send order confirmation email (fire and forget)
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/email");
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      await sendOrderConfirmationEmail({
        recipientName:
          order.first_name && order.last_name
            ? `${order.first_name} ${order.last_name}`
            : undefined,
        recipientEmail: order.email,
        orderNumber: order.order_number,
        orderDate: order.created_at,
        items: order.items.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping_cost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        shippingAddress: order.shipping_address
          ? {
              first_name: order.shipping_address.first_name,
              last_name: order.shipping_address.last_name,
              address_1: order.shipping_address.address_1,
              address_2: order.shipping_address.address_2 || undefined,
              city: order.shipping_address.city,
              state: order.shipping_address.state,
              postal_code: order.shipping_address.postal_code,
              country: order.shipping_address.country,
            }
          : {
              first_name: order.first_name,
              last_name: order.last_name,
              address_1: "", // Guest orders don't have saved addresses
              address_2: undefined,
              city: "",
              state: "",
              postal_code: "",
              country: "Nigeria",
            },
        trackingNumber: order.tracking_number || undefined,
        orderUrl: `${baseUrl}/order-confirmation?order=${order.order_number}`,
      });
    } catch (error) {
      // Log error but don't fail order creation if email fails
      console.error("Failed to send order confirmation email:", error);
    }

    return {
      order,
      orderNumber: order.order_number,
      message: "Order created successfully",
    };
  });

// Create guest order with payment (for unauthenticated users)
export const createGuestOrderWithPayment = publicProcedure
  .input(
    z.object({
      // Payment response from Monnify
      paymentResponse: z.object({
        paymentStatus: z.string(),
        transactionReference: z.string().optional(),
        paymentReference: z.string(),
        amountPaid: z.string().optional(),
        paymentDescription: z.string().optional(),
        customerEmail: z.string().email(),
        customerName: z.string(),
      }),
      // Address data
      address: z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        address_1: z.string().min(1),
        address_2: z.string().optional(),
        city: z.string().min(1),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().default("Nigeria"),
      }),
      // Order items from cart
      items: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().int().min(1),
        }),
      ),
      // Calculated totals
      totals: z.object({
        subtotal: z.number(),
        shipping: z.number(),
        tax: z.number(),
        discount: z.number().default(0),
        total: z.number(),
      }),
      // Payment method (defaults to WALLET for Monnify)
      payment_method: z.nativeEnum(PaymentMethod).default("WALLET"),
      currency: z.nativeEnum(Currency).default("NGN"),
      notes: z.string().optional(),
      // Optional promo code
      promo_code: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const {
      paymentResponse,
      address,
      items: orderItems,
      totals,
      payment_method,
      currency,
      notes,
      promo_code: _promo_code,
    } = input;

    // Validate payment status
    if (paymentResponse.paymentStatus !== "PAID") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Payment not completed. Status: ${paymentResponse.paymentStatus}`,
      });
    }

    // Validate products and check stock
    const products = await ctx.prisma.product.findMany({
      where: { id: { in: orderItems.map((item) => item.product_id) } },
    });

    if (products.length !== orderItems.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Some products not found",
      });
    }

    // Check stock availability
    for (const orderItem of orderItems) {
      const product = products.find((p) => p.id === orderItem.product_id);
      if (!product) continue;

      if (product.track_quantity && product.quantity < orderItem.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // Validate payment amount matches order total
    const expectedTotal = totals.total;
    const paidAmount = paymentResponse.amountPaid
      ? parseFloat(paymentResponse.amountPaid)
      : expectedTotal;

    // Allow small floating point differences (e.g., 0.01)
    if (Math.abs(paidAmount - expectedTotal) > 0.01) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Payment amount mismatch. Expected: ${expectedTotal}, Received: ${paidAmount}`,
      });
    }

    // For guest orders, we skip creating a separate Address record
    // since Address model requires user_id (not nullable)
    // The Order model already stores address info in its own fields
    // shipping_address_id will be undefined for guest orders

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with payment (no user_id for guest orders)
    const order = await ctx.prisma.order.create({
      data: {
        order_number: orderNumber,
        // No user_id for guest orders
        email: address.email,
        first_name: address.first_name,
        last_name: address.last_name,
        phone: address.phone,
        payment_method,
        currency,
        shipping_address_id: undefined, // Guest orders don't have a shipping_address_id
        notes,
        subtotal: totals.subtotal,
        shipping_cost: totals.shipping,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        payment_status: "COMPLETED",
        status: "PENDING",
        items: {
          create: orderItems.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
            if (!product) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Product not found for item ${item.product_id}`,
              });
            }
            return {
              product_id: item.product_id,
              product_name: product.name,
              product_sku: product.sku,
              price: product.price,
              quantity: item.quantity,
              total: Number(product.price) * item.quantity,
            };
          }),
        },
        payments: {
          create: {
            payment_method,
            status: "COMPLETED",
            amount: totals.total,
            currency,
            transaction_id: paymentResponse.transactionReference || undefined,
            reference: paymentResponse.paymentReference,
            gateway_response: paymentResponse as Prisma.InputJsonValue,
            processed_at: new Date(),
          },
        },
        status_history: {
          create: [
            {
              status: "PENDING",
              notes: "Guest order created",
              created_by: "system",
            },
            {
              status: "PENDING",
              notes: "Payment completed",
              created_by: "system",
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
        shipping_address: true,
        payments: true,
      },
    });

    // Update product quantities
    for (const item of orderItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;
      if (product.track_quantity) {
        await ctx.prisma.product.update({
          where: { id: item.product_id },
          data: {
            quantity: { decrement: item.quantity },
            reserved_quantity: { increment: item.quantity },
            sale_count: { increment: item.quantity },
          },
        });
      }
    }

    // Send order confirmation email (fire and forget)
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/email");
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      await sendOrderConfirmationEmail({
        recipientName:
          order.first_name && order.last_name
            ? `${order.first_name} ${order.last_name}`
            : undefined,
        recipientEmail: order.email,
        orderNumber: order.order_number,
        orderDate: order.created_at,
        items: order.items.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping_cost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        shippingAddress: {
          first_name: order.first_name,
          last_name: order.last_name,
          address_1: address.address_1,
          address_2: address.address_2 || undefined,
          city: address.city,
          state: address.state || "",
          postal_code: address.postal_code || "",
          country: address.country || "Nigeria",
        },
        trackingNumber: order.tracking_number || undefined,
        orderUrl: `${baseUrl}/order-confirmation?order=${order.order_number}&guest=true&email=${encodeURIComponent(order.email)}`,
      });
    } catch (error) {
      // Log error but don't fail order creation if email fails
      console.error("Failed to send order confirmation email:", error);
    }

    return {
      order,
      orderNumber: order.order_number,
      message: "Guest order created successfully",
    };
  });

// Update order status (staff)
export const updateOrderStatus = staffProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.nativeEnum(OrderStatus),
      notes: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.update({
      where: { id: input.id },
      data: {
        status: input.status,
        status_history: {
          create: {
            status: input.status,
            notes: input.notes,
            created_by: ctx.user.id,
          },
        },
      },
      include: {
        items: true,
        shipping_address: true,
      },
    });

    return { order, message: "Order status updated successfully" };
  });

// Update tracking number (staff)
export const updateTrackingNumber = staffProcedure
  .input(
    z.object({
      id: z.string(),
      trackingNumber: z.string().min(1, "Tracking number is required"),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.id },
    });

    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    const updatedOrder = await ctx.prisma.order.update({
      where: { id: input.id },
      data: {
        tracking_number: input.trackingNumber,
      },
      include: {
        items: true,
        shipping_address: true,
      },
    });

    return {
      order: updatedOrder,
      message: "Tracking number updated successfully",
    };
  });

// Cancel order
export const cancelOrder = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      reason: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.id },
      include: { items: true },
    });

    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    if (order.user_id !== ctx.user.id && ctx.user.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }

    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot cancel this order",
      });
    }

    const updatedOrder = await ctx.prisma.order.update({
      where: { id: input.id },
      data: {
        status: "CANCELLED",
        cancelled_at: new Date(),
        cancellation_reason: input.reason,
        status_history: {
          create: {
            status: "CANCELLED",
            notes: input.reason || "Order cancelled by customer",
            created_by: ctx.user.id,
          },
        },
      },
    });

    // Restore product quantities
    for (const item of order.items) {
      await ctx.prisma.product.update({
        where: { id: item.product_id },
        data: {
          quantity: { increment: item.quantity },
          reserved_quantity: { decrement: item.quantity },
        },
      });
    }

    return { order: updatedOrder, message: "Order cancelled successfully" };
  });

// Get order by number (public - for guest orders)
export const getOrderByNumberPublic = publicProcedure
  .input(
    z.object({
      orderNumber: z.string().min(1),
      email: z.string().email().optional(), // Optional email verification for guest orders
    }),
  )
  .query(async ({ input, ctx }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { order_number: input.orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          },
        },
        shipping_address: true,
        payments: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
        status_history: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!order) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
    }

    // For guest orders, verify email if provided
    if (!order.user_id && input.email) {
      if (order.email.toLowerCase() !== input.email.toLowerCase()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Email does not match order",
        });
      }
    }

    // For authenticated users, check ownership
    if (order.user_id && ctx.session?.user) {
      if (
        order.user_id !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }
    }

    return order;
  });

// Get order statistics (staff)
export const getOrderStats = staffProcedure.query(async ({ ctx }) => {
  const [total, pending, processing, shipped, delivered, cancelled] =
    await Promise.all([
      ctx.prisma.order.count(),
      ctx.prisma.order.count({ where: { status: "PENDING" } }),
      ctx.prisma.order.count({ where: { status: "PROCESSING" } }),
      ctx.prisma.order.count({ where: { status: "SHIPPED" } }),
      ctx.prisma.order.count({ where: { status: "DELIVERED" } }),
      ctx.prisma.order.count({ where: { status: "CANCELLED" } }),
    ]);

  const revenue = await ctx.prisma.order.aggregate({
    where: { payment_status: "COMPLETED" },
    _sum: { total: true },
  });

  return {
    total,
    pending,
    processing,
    shipped,
    delivered,
    cancelled,
    revenue: revenue._sum.total || 0,
  };
});
