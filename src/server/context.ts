import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createTRPCContext({ req }: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  return {
    prisma,
    session,
    ip,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
