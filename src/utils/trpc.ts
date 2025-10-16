import { AppRouter } from '@/server'
import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'


export const trpc = createTRPCReact<AppRouter>()

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>