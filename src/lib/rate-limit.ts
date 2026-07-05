/**
 * Simple in-memory rate limiter for login attempts.
 *
 * Limits: 5 attempts per 15 minutes per identifier (IP or email).
 *
 * Note: This is in-memory (not Redis). For a 100-user app, this is sufficient.
 * If the app grows, switch to Redis-based rate limiting.
 *
 * See docs/ERROR_HANDLING.md Section 4, Pattern 4 for full details.
 */

import { logger } from "@/lib/logger";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 attempts per window

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetAt: number;
} {
  const now = Date.now();
  const existing = attempts.get(identifier);

  // Reset if window expired
  if (!existing || existing.resetAt < now) {
    attempts.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_MAX - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  // Increment attempt count
  existing.count++;

  if (existing.count > RATE_LIMIT_MAX) {
    logger.warn("Rate limit exceeded", {
      identifier,
      attempts: existing.count,
    });
    return {
      allowed: false,
      remainingAttempts: 0,
      resetAt: existing.resetAt,
    };
  }

  return {
    allowed: true,
    remainingAttempts: RATE_LIMIT_MAX - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Clean up expired entries (call periodically to prevent memory leak).
 * In production, this could be a cron job or called on each rate limit check.
 */
export function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of attempts.entries()) {
    if (value.resetAt < now) {
      attempts.delete(key);
    }
  }
}