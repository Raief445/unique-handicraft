import prisma from "@/lib/db";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Atomic, persistent rate limiting backed by PostgreSQL.
 * Persists across Vercel serverless function invocations without requiring external SaaS.
 *
 * @param key Identifier for the rate-limit window (e.g., "track:192.168.1.1")
 * @param limit Maximum allowed requests within the time window
 * @param windowMs Time window in milliseconds (e.g., 15 * 60 * 1000 for 15 minutes)
 */
export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // 1. Opportunistic asynchronous cleanup of stale expired records (10% sample to minimize overhead)
    if (Math.random() < 0.1) {
      prisma.rateLimit
        .deleteMany({
          where: { expiresAt: { lt: now } },
        })
        .catch(() => {});
    }

    // 2. Fetch existing entry
    const existing = await prisma.rateLimit.findUnique({
      where: { key },
    });

    // 3. If no record or expired, reset window
    if (!existing || existing.expiresAt < now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          expiresAt: resetAt,
        },
        update: {
          count: 1,
          expiresAt: resetAt,
        },
      });

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt,
      };
    }

    // 4. If limit exceeded
    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.expiresAt,
      };
    }

    // 5. Increment count atomically
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.count),
      resetAt: existing.expiresAt,
    };
  } catch (error) {
    // Graceful fallback: If rate-limiting DB query fails, do not hard-block legitimate users
    console.error("Rate limit check failed gracefully:", error);
    return {
      allowed: true,
      remaining: 1,
      resetAt,
    };
  }
}
