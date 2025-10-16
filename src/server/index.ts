import { orderRouter } from './routers/order-router-new'
import { productRouter } from './routers/product-router-new'
import { userRouter } from './routers/user-router-new'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  user: userRouter,
  product: productRouter,
  order: orderRouter,
})

export type AppRouter = typeof appRouter