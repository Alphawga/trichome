import { z } from "zod";
import { staffProcedure } from "../trpc";

export const getNotifications = staffProcedure
  .input(
    z.object({
      limit: z.number().int().min(1).max(50).default(20),
    }),
  )
  .query(async ({ input, ctx }) => {
    return ctx.prisma.notification.findMany({
      orderBy: { created_at: "desc" },
      take: input.limit,
      include: {
        order: {
          select: { id: true, order_number: true },
        },
      },
    });
  });

export const getUnreadNotificationCount = staffProcedure.query(
  async ({ ctx }) => {
    return ctx.prisma.notification.count({ where: { read: false } });
  },
);

export const markNotificationAsRead = staffProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    return ctx.prisma.notification.update({
      where: { id: input.id },
      data: { read: true },
    });
  });

export const markAllNotificationsAsRead = staffProcedure.mutation(
  async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return { success: true };
  },
);
