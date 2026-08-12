import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export router and base procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  // You'll need to add role checking based on your user model
  // For now, this is a placeholder
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({
    ctx,
  });
});

// Staff procedure - requires staff or admin role
export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "STAFF" && ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Staff access required",
    });
  }

  return next({
    ctx,
  });
});

async function assertNotRateLimited(
  name: string,
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const { allowed, retryAfterSeconds } = await checkRateLimit(
    `${name}:${key}`,
    limit,
    windowSeconds,
  );

  if (!allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many requests. Try again in ${retryAfterSeconds}s.`,
    });
  }
}

// Guest checkout - unauthenticated, rate limited by IP
export const guestCheckoutRateLimited = publicProcedure.use(
  async ({ ctx, next }) => {
    await assertNotRateLimited("guestCheckout", ctx.ip, 5, 600);
    return next();
  },
);

// Authenticated checkout - rate limited by user id
export const checkoutRateLimited = protectedProcedure.use(
  async ({ ctx, next }) => {
    await assertNotRateLimited("checkout", ctx.user.id, 10, 600);
    return next();
  },
);

// Preparing an attempt and finalizing it are two separate requests. Keep
// preparation in its own bucket so one checkout does not consume the order
// finalization allowance twice.
export const guestCheckoutPreparationRateLimited = publicProcedure.use(
  async ({ ctx, next }) => {
    await assertNotRateLimited("guestCheckoutPreparation", ctx.ip, 5, 600);
    return next();
  },
);

export const checkoutPreparationRateLimited = protectedProcedure.use(
  async ({ ctx, next }) => {
    await assertNotRateLimited("checkoutPreparation", ctx.user.id, 10, 600);
    return next();
  },
);

// Shipping quote - unauthenticated (guest checkout needs it too), rate limited
// by IP. More generous than checkout limiters since this fires on every
// address-field change rather than once on submit.
export const shippingQuoteRateLimited = publicProcedure.use(
  async ({ ctx, next }) => {
    await assertNotRateLimited("shippingQuote", ctx.ip, 30, 60);
    return next();
  },
);

// Page view tracking beacon - unauthenticated, fires on every storefront
// navigation, rate limited by IP to bound write volume from bots/scripts.
export const pageViewRateLimited = publicProcedure.use(
  async ({ ctx, next }) => {
    await assertNotRateLimited("pageView", ctx.ip, 60, 60);
    return next();
  },
);
