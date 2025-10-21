import { orderRouter } from './routers/order-router'
import { productRouter } from './routers/product-router'
import { userRouter } from './routers/user-router'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  user: userRouter,
  product: productRouter,
  order: orderRouter,
})

export type AppRouter = typeof appRouter