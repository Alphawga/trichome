import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

interface RateLimitRow {
  count: number;
  expires_at: Date;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<RateLimitRow[]>`
      INSERT INTO rate_limits (id, key, count, expires_at, created_at, updated_at)
      VALUES (${randomUUID()}, ${key}, 1, (now() AT TIME ZONE 'UTC') + (${windowSeconds} || ' seconds')::interval, (now() AT TIME ZONE 'UTC'), (now() AT TIME ZONE 'UTC'))
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.expires_at < (now() AT TIME ZONE 'UTC') THEN 1 ELSE rate_limits.count + 1 END,
        expires_at = CASE WHEN rate_limits.expires_at < (now() AT TIME ZONE 'UTC') THEN (now() AT TIME ZONE 'UTC') + (${windowSeconds} || ' seconds')::interval ELSE rate_limits.expires_at END,
        updated_at = (now() AT TIME ZONE 'UTC')
      RETURNING count, expires_at;
    `;

    const row = rows[0];
    if (!row || row.count <= limit) {
      return { allowed: true };
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  } catch (error) {
    console.error("Rate limit check failed, failing open:", error);
    return { allowed: true };
  }
}
