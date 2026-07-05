"use client";

/**
 * Global Error Boundary
 *
 * Catches errors in the root layout (the highest level).
 * This file MUST include its own <html> and <body> tags.
 *
 * See docs/ERROR_HANDLING.md Section 2, Layer 2 for full details.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ba1a1a", marginBottom: "1rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#43474e", marginBottom: "1.5rem", textAlign: "center", maxWidth: "28rem" }}>
            An unexpected error occurred. Your data is safe. Please try again
            or refresh the page.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#74777f",
                marginBottom: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              backgroundColor: "#002045",
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}