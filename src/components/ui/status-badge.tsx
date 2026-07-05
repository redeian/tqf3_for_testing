type Status = "draft" | "completed" | "incomplete";

const config: Record<
  Status,
  { container: string; dot: string; label: string }
> = {
  draft: {
    container: "bg-secondary-container text-on-secondary-container",
    dot: "bg-secondary",
    label: "Draft",
  },
  completed: {
    container: "bg-[#e8f5e9] text-[#2e7d32]",
    dot: "bg-[#2e7d32]",
    label: "Completed",
  },
  incomplete: {
    container: "bg-error-container text-on-error-container",
    dot: "bg-error",
    label: "Incomplete",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${c.container}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
