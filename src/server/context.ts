import { prisma } from '@prisma/client'

export async function createTRPCContext() {
  return {
    prisma,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>