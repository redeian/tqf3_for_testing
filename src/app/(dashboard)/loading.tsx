/**
 * Loading fallback for the dashboard route group.
 *
 * Shows a skeleton UI while Server Components fetch data.
 * Uses Tailwind's animate-pulse for a clean loading state.
 *
 * See docs/ERROR_HANDLING.md Section 2, Layer 3 for full details.
 */

export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      {/* Header skeleton */}
      <div className="h-8 bg-surface-container rounded w-1/4" />
      <div className="h-4 bg-surface-container rounded w-1/3" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-surface-container rounded-xl"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="h-96 bg-surface-container rounded-xl" />
    </div>
  );
}