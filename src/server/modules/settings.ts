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

