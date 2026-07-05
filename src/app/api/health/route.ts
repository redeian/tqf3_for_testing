/**
 * Health Check Endpoint
 *
 * Returns 200 if the app and database are healthy.
 * Returns 503 if any critical component is unhealthy.
 *
 * This endpoint is public (no auth required) — it's used by:
 * - Docker healthcheck (every 30s)
 * - Caddy reverse proxy (every 10s)
 * - CI/CD post-deploy verification
 * - Optional monitoring cron job
 *
 * See docs/ERROR_HANDLING.md Section 3 for full details.
 */
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  const checks: Record<
    string,
    { status: string; latency?: number; error?: string }
  > = {};

  // --- Check 1: Database connectivity ---
  try {
    const start = Date.now();
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      connectTimeout: 5000,
    });
    await connection.ping();
    await connection.end();
    checks.database = {
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // --- Check 2: Application responsiveness ---
  checks.application = { status: "healthy" };

  // --- Determine overall status ---
  const allHealthy = Object.values(checks).every((c) => c.status === "healthy");
  const status = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
      checks,
    },
    { status },
  );
}