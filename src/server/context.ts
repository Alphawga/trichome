import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function createTRPCContext() {
  const session = await getServerSession()

  return {
    prisma,
    session,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>