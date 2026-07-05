/**
 * Shared TypeScript types
 */

/**
 * Standard return type for all Server Actions.
 * Never throw to the client — always return a result.
 *
 * Success: { success: true, data: T }
 * Error:   { success: false, error: "User-facing message", fieldErrors? }
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };