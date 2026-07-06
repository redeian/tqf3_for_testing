type LevelCount = {
  level: "undergraduate" | "graduate" | "doctoral";
  count: number;
};

type LevelSummaryProps = {
  counts: LevelCount[];
};

const LEVEL_CONFIG = {
  undergraduate: {
    label: "ปริญญาตรี",
    color: "bg-secondary",
    barColor: "bg-secondary",
  },
  graduate: {
    label: "ปริญญาโท",
    color: "bg-[#2e7d32]",
    barColor: "bg-[#2e7d32]",
  },
  doctoral: {
    label: "ปริญญาเอก",
    color: "bg-[#e65100]",
    barColor: "bg-[#e65100]",
  },
} as const;

export function LevelSummary({ counts }: LevelSummaryProps) {
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="mb-8">
      <h2 className="text-headline-sm text-primary mb-4">
        ภาพรวมหลักสูตรแยกตามระดับ
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {counts.map(({ level, count }) => {
          const config = LEVEL_CONFIG[level];
          return (
            <div
              key={level}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5"
            >
              <p className="text-body-sm text-on-surface-variant mb-1">
                {config.label}
              </p>
              <p className="text-display-sm font-bold text-primary">{count}</p>
              <p className="text-body-sm text-on-surface-variant">วิชา</p>
            </div>
          );
        })}
      </div>
      {/* CSS Bar Chart */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
        <p className="text-body-sm text-on-surface-variant mb-3">
          สัดส่วนหลักสูตร
        </p>
        <div className="space-y-3">
          {counts.map(({ level, count }) => {
            const config = LEVEL_CONFIG[level];
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <span className="w-20 text-body-sm text-on-surface font-medium shrink-0">
                  {config.label}
                </span>
                <div className="flex-1 h-5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-body-sm text-on-surface-variant text-right shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
