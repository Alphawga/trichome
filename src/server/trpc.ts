import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { type Context } from './context'

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
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Example protected procedure (you can add auth logic here later)
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // Add authentication check here
  // if (!ctx.session?.user) {
  //   throw new TRPCError({ code: 'UNAUTHORIZED' })
  // }

  return next({
    ctx: {
      ...ctx,
      // user: ctx.session.user,
    },
  })
})