import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting pro veřejně dostupné API endpointy (registrace, recenze,
 * komentáře, follow…), aby appka po zveřejnění nešla zahltit boty/spamem.
 *
 * Pokud jsou nastavené UPSTASH_REDIS_REST_URL a UPSTASH_REDIS_REST_TOKEN
 * (Vercel Marketplace → Upstash), používá se sdílený Redis limiter — funguje
 * správně napříč všemi serverless instancemi.
 *
 * Bez nich appka NESPADNE, ale spadne do jednoduchého in-memory fallbacku,
 * který funguje jen "nejlíp jak umí": v produkci na Vercelu běží víc instancí
 * funkce současně, takže limit není garantovaný napříč nimi. Fallback je tu
 * pro lokální vývoj a jako záchranná síť, ne jako produkční řešení — pro
 * ostrý provoz Upstash skutečně zapoj.
 */

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(name: string, limit: number, windowSeconds: number): Ratelimit {
  const key = `${name}:${limit}:${windowSeconds}`;
  let limiter = upstashLimiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `gamevault:ratelimit:${name}`,
    });
    upstashLimiters.set(key, limiter);
  }
  return limiter;
}

// In-memory fallback — čistí se sám při každém volání (žádný cron potřeba).
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function checkMemoryLimit(
  bucketKey: string,
  limit: number,
  windowSeconds: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const bucket = memoryBuckets.get(bucketKey);

  if (!bucket || bucket.resetAt < now) {
    memoryBuckets.set(bucketKey, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * @param name       Logický název limitu (např. "register", "review") — izoluje kbelíky od sebe.
 * @param identifier Obvykle IP adresa nebo `userId`.
 * @param limit      Kolik requestů je povoleno v okně.
 * @param windowSeconds Délka okna v sekundách.
 */
export async function checkRateLimit(
  name: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (hasUpstash && redis) {
    const limiter = getUpstashLimiter(name, limit, windowSeconds);
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  }

  return checkMemoryLimit(`${name}:${identifier}`, limit, windowSeconds);
}

/** Vytáhne nejlepší dostupnou IP z requestu (Vercel posílá x-forwarded-for). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}