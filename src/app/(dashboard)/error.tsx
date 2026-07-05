"use client";

/**
 * Dashboard Error Boundary
 *
 * Catches errors within the (dashboard) route group.
 * Renders a fallback UI with a retry button.
 *
 * See docs/ERROR_HANDLING.md Section 2, Layer 2 for full details.
 */

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <span style={{ fontSize: "3rem", color: "#ba1a1a", marginBottom: "1rem" }}>
        ⚠
      </span>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        This page couldn&apos;t load
      </h2>
      <p style={{ color: "#43474e", marginBottom: "1.5rem", textAlign: "center" }}>
        {error.message || "An error occurred while loading this page."}
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={reset}
          style={{
            backgroundColor: "#002045",
            color: "#ffffff",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          Try again
        </button>
        <a
          href="/dashboard"
          style={{
            border: "1px solid #c4c6cf",
            color: "#43474e",
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}