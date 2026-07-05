/**
 * Structured Logger
 *
 * Outputs JSON in production (Docker captures stdout).
 * Pretty-prints in development for readability.
 *
 * Usage:
 *   logger.info("User logged in", { userId: "xxx" });
 *   logger.error("DB connection failed", { error: "ECONNREFUSED" });
 *
 * See docs/ERROR_HANDLING.md Section 2, Layer 4 for full details.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (process.env.NODE_ENV === "production") {
    // JSON to stdout — Docker captures and formats
    const consoleMethod = level === "debug" ? "log" : level;
    console[consoleMethod](JSON.stringify(entry));
  } else {
    // Pretty print in development
    const prefix = level.toUpperCase().padEnd(5);
    const consoleMethod = level === "debug" ? "log" : level;
    console[consoleMethod](`[${prefix}] ${message}`, context ?? "");
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
};