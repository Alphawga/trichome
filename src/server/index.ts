import { router, publicProcedure } from './trpc'


import * as authModule from './modules/auth'
import * as usersModule from './modules/users'
import * as productsModule from './modules/products'
import * as categoriesModule from './modules/categories'
import * as cartModule from './modules/cart'
import * as wishlistModule from './modules/wishlist'
import * as ordersModule from './modules/orders'
import * as addressesModule from './modules/addresses'
import * as newsletterModule from './modules/newsletter'
import * as contentModule from './modules/content'
import * as analyticsModule from './modules/analytics'
import * as dashboardModule from './modules/dashboard'

// Compose into single router using spread operator
export const appRouter = router({

  ...authModule,
  ...usersModule,
  ...productsModule,
  ...categoriesModule,
  ...cartModule,
  ...wishlistModule,
  ...ordersModule,
  ...addressesModule,
  ...newsletterModule,
  ...contentModule,
  ...analyticsModule,
  ...dashboardModule,

  // Health check
  healthCheck: publicProcedure.query(() => {
    return {
      status: 'ok',
      message: 'Trichome API is running',
      timestamp: new Date().toISOString(),
    }
  }),
})

export type AppRouter = typeof appRouter