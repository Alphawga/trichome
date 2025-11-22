import * as addressesModule from "./modules/addresses";
import * as analyticsModule from "./modules/analytics";
import * as authModule from "./modules/auth";
import * as brandsModule from "./modules/brands";
import * as cartModule from "./modules/cart";
import * as categoriesModule from "./modules/categories";
import * as consultationsModule from "./modules/consultations";
import * as contentModule from "./modules/content";
import * as dashboardModule from "./modules/dashboard";
import * as loyaltyModule from "./modules/loyalty";
import * as newsletterModule from "./modules/newsletter";
import * as ordersModule from "./modules/orders";
import * as paymentsModule from "./modules/payments";
import * as productsModule from "./modules/products";
import * as promotionsModule from "./modules/promotions";
import * as reviewsModule from "./modules/reviews";
import * as searchModule from "./modules/search";
import * as settingsModule from "./modules/settings";
import * as trackingModule from "./modules/tracking";
import * as usersModule from "./modules/users";
import * as wishlistModule from "./modules/wishlist";
import { publicProcedure, router } from "./trpc";

// Compose into single router using spread operator
export const appRouter = router({
  ...authModule,
  ...usersModule,
  ...productsModule,
  ...categoriesModule,
  ...brandsModule,
  ...cartModule,
  ...wishlistModule,
  ...ordersModule,
  ...paymentsModule,
  ...addressesModule,
  ...newsletterModule,
  ...contentModule,
  ...analyticsModule,
  ...dashboardModule,
  ...promotionsModule,
  ...consultationsModule,
  ...reviewsModule,
  ...trackingModule,
  ...searchModule,
  ...loyaltyModule,
  ...settingsModule,

  // Health check
  healthCheck: publicProcedure.query(() => {
    return {
      status: "ok",
      message: "Trichome API is running",
      timestamp: new Date().toISOString(),
    };
  }),
});

export type AppRouter = typeof appRouter;
