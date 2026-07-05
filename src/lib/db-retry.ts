/**
 * Database retry helper with exponential backoff.
 *
 * Retries transient DB failures (connection timeouts, temporary unavailability).
 * Does NOT retry on expected errors (duplicate entries, access denied).
 *
 * Usage:
 *   const result = await withRetry(
 *     () => db.insert(syllabi).values(data).$returningId(),
 *     "createSyllabus"
 *   );
 *
 * See docs/ERROR_HANDLING.md Section 4, Pattern 1 for full details.
 */

import { logger } from "@/lib/logger";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;
const RETRY_BACKOFF = 2; // exponential: 500ms, 1000ms, 2000ms

// Errors that should NOT be retried (they'll fail again)
const NON_RETRYABLE_ERRORS = [
  "Duplicate entry",
  "Access denied",
  "Unknown column",
  "Table doesn't exist",
];

export async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(String(error));

      // Don't retry on expected errors
      if (
        NON_RETRYABLE_ERRORS.some((msg) =>
          lastError!.message.includes(msg),
        )
      ) {
        throw lastError;
      }

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF, attempt - 1);
        logger.warn(
          `DB operation failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms`,
          {
            context,
            error: lastError.message,
          },
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`DB operation failed after ${MAX_RETRIES} attempts`, {
    context,
    error: lastError?.message,
  });
  throw lastError ?? new Error("Unknown error after retries");
}