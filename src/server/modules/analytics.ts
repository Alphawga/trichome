import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getDailyAnalytics,
  summarizeDailyAnalytics,
} from "@/lib/analytics/aggregate";
import { pageViewRateLimited, staffProcedure } from "../trpc";

const VISITOR_COOKIE = "trichome_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Get analytics for date range
export const getAnalytics = staffProcedure
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .query(async ({ input }) => {
    return getDailyAnalytics(input.startDate, input.endDate);
  });

// Get analytics summary
export const getAnalyticsSummary = staffProcedure
  .input(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    }),
  )
  .query(async ({ input }) => {
    const days = await getDailyAnalytics(input.startDate, input.endDate);
    return summarizeDailyAnalytics(days);
  });

// Track a page view (public - fires from anonymous storefront visitors too)
export const trackPageView = pageViewRateLimited.mutation(async ({ ctx }) => {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;

  if (!visitorId) {
    visitorId = randomUUID();
    cookieStore.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });
  }

  try {
    await ctx.prisma.$executeRaw`
      INSERT INTO visitor_daily_stats (id, visitor_id, date, page_view_count, first_seen_at, last_seen_at)
      VALUES (${randomUUID()}, ${visitorId}, (now() AT TIME ZONE 'UTC')::date, 1, (now() AT TIME ZONE 'UTC'), (now() AT TIME ZONE 'UTC'))
      ON CONFLICT (visitor_id, date) DO UPDATE SET
        page_view_count = visitor_daily_stats.page_view_count + 1,
        last_seen_at = (now() AT TIME ZONE 'UTC')
    `;
  } catch (error) {
    // Best-effort analytics write; never fail the page over a transient DB error.
    console.error("Page view tracking failed:", error);
  }

  return { success: true };
});
