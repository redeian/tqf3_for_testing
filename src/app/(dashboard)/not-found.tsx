/**
 * Not Found (404) page for the dashboard route group.
 *
 * Shows when a user navigates to a URL that doesn't exist.
 *
 * See docs/ERROR_HANDLING.md Section 2, Layer 2 for full details.
 */

export default function NotFound() {
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
      <span style={{ fontSize: "3rem", color: "#74777f", marginBottom: "1rem" }}>
        🔍
      </span>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Page not found
      </h2>
      <p style={{ color: "#43474e", marginBottom: "1.5rem" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/dashboard"
        style={{
          backgroundColor: "#002045",
          color: "#ffffff",
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
  );
}