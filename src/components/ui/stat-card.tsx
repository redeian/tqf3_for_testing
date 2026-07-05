type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "primary" | "error" | "secondary" | "success";
  decoration?: React.ReactNode;
};

const toneMap = {
  primary: "text-primary",
  error: "text-error",
  secondary: "text-secondary",
  success: "text-[#2e7d32]",
};

export function StatCard({
  label,
  value,
  tone = "primary",
  decoration,
}: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col gap-2">
      <span className="text-on-surface-variant text-label-md">{label}</span>
      <div className="flex justify-between items-end">
        <span className={`text-display-lg ${toneMap[tone]}`}>{value}</span>
        {decoration}
      </div>
    </div>
  );
}
