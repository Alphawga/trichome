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

// Export router and base procedure
export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  })
})

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  // You'll need to add role checking based on your user model
  // For now, this is a placeholder
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }

  return next({
    ctx,
  })
})

// Staff procedure - requires staff or admin role
export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'STAFF' && ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Staff access required' })
  }

  return next({
    ctx,
  })
})