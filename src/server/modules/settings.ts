import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, staffProcedure } from "../trpc";

// Get all settings (staff/admin)
export const getSettings = staffProcedure.query(async ({ ctx }) => {
  const settings = await ctx.prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });

  return settings;
});

// Get setting by key (staff/admin)
export const getSettingByKey = staffProcedure
  .input(z.object({ key: z.string() }))
  .query(async ({ input, ctx }) => {
    const setting = await ctx.prisma.systemSetting.findUnique({
      where: { key: input.key },
    });

    if (!setting) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Setting not found",
      });
    }

    return setting;
  });

// Create or update setting (admin only)
export const upsertSetting = adminProcedure
  .input(
    z.object({
      key: z.string().min(1),
      value: z.string(),
      type: z.string().default("string"),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const setting = await ctx.prisma.systemSetting.upsert({
      where: { key: input.key },
      update: {
        value: input.value,
        type: input.type,
      },
      create: {
        key: input.key,
        value: input.value,
        type: input.type,
      },
    });

    return { setting, message: "Setting saved successfully" };
  });

// Delete setting (admin only)
export const deleteSetting = adminProcedure
  .input(z.object({ key: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.prisma.systemSetting.delete({
      where: { key: input.key },
    });

    return { message: "Setting deleted successfully" };
  });

// Get settings by category (helper for frontend)
export const getSettingsByCategory = staffProcedure.query(async ({ ctx }) => {
  const settings = await ctx.prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });

  // Group settings by category (based on key prefix)
  const categories: Record<
    string,
    Array<{ key: string; value: string; type: string }>
  > = {};

  settings.forEach((setting) => {
    const parts = setting.key.split("_");
    const category = parts[0] || "general";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({
      key: setting.key,
      value: setting.value,
      type: setting.type,
    });
  });

  return categories;
});

// Send test email (admin only)
export const sendTestEmail = adminProcedure
  .input(
    z.object({
      emailType: z.enum([
        "welcome",
        "order_confirmation",
        "shipping",
        "password_reset",
        "newsletter",
      ]),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // Get admin email
    const adminEmail = ctx.user.email;
    if (!adminEmail) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Admin email not found",
      });
    }

    const adminName = ctx.user.first_name || "Admin";

    try {
      // Dynamic import for email functions
      const emailLib = await import("@/lib/email");

      let result;

      switch (input.emailType) {
        case "welcome":
          result = await emailLib.sendWelcomeEmail({
            recipientName: adminName,
            recipientEmail: adminEmail,
            loginUrl: process.env.NEXT_PUBLIC_APP_URL || "https://trichomes.com",
          });
          break;

        case "order_confirmation":
          result = await emailLib.sendOrderConfirmationEmail({
            recipientName: adminName,
            recipientEmail: adminEmail,
            orderNumber: "TEST-ORDER-123",
            orderDate: new Date(),
            items: [
              { name: "Test Product 1", quantity: 2, price: 5000 },
              { name: "Test Product 2", quantity: 1, price: 7500 },
            ],
            subtotal: 17500,
            shipping: 1500,
            tax: 1312,
            discount: 0,
            total: 20312,
            shippingAddress: {
              first_name: "Test",
              last_name: "Customer",
              address_1: "123 Test Street",
              city: "Lagos",
              state: "Lagos",
              postal_code: "100001",
              country: "Nigeria",
            },
            orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://trichomes.com"}/order-confirmation?order=TEST-ORDER-123`,
          });
          break;

        case "shipping":
          result = await emailLib.sendShippingUpdateEmail({
            recipientName: adminName,
            recipientEmail: adminEmail,
            orderNumber: "TEST-ORDER-123",
            trackingNumber: "TRK123456789",
            carrier: "DHL Express",
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            trackingUrl: "https://www.dhl.com/track?id=TRK123456789",
            orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://trichomes.com"}/track-order?order=TEST-ORDER-123`,
          });
          break;

        case "password_reset":
          result = await emailLib.sendPasswordResetEmail({
            email: adminEmail,
            resetToken: "test-reset-token-12345",
            name: adminName,
          });
          break;

        case "newsletter":
          result = await emailLib.sendNewsletterWelcomeEmail({
            recipientEmail: adminEmail,
            unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://trichomes.com"}/unsubscribe?email=${encodeURIComponent(adminEmail)}`,
          });
          break;

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unknown email type",
          });
      }

      if (!result?.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result?.error || "Failed to send test email",
        });
      }

      return { success: true, message: `Test ${input.emailType} email sent to ${adminEmail}` };
    } catch (error) {
      console.error("Error sending test email:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to send test email",
      });
    }
  });


