import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createTRPCContext() {
  const session = await getServerSession(authOptions)

  return {
    prisma,
    session,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>