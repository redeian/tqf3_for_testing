const items = [
  {
    code: "IT601201",
    name: "UI Design",
    actor: "ผศ.ดร. มานะ",
    time: "2 ชม. ที่แล้ว",
    active: true,
  },
  {
    code: "GE100122",
    name: "Digital Lit",
    actor: "คุณจอย",
    time: "5 ชม. ที่แล้ว",
    active: false,
  },
];

export function RecentHistory() {
  return (
    <div className="bg-surface-container-high p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">history</span>
        <h4 className="text-label-md text-primary">
          ประวัติการแก้ไขล่าสุด
        </h4>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.code} className="flex gap-3">
            <div
              className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                item.active ? "bg-secondary" : "bg-outline-variant"
              }`}
            />
            <div>
              <p className="text-body-sm font-semibold">
                {item.code}: {item.name}
              </p>
              <p className="text-[12px] text-on-surface-variant">
                {item.active ? "แก้ไขโดย" : "บันทึกฉบับร่างโดย"} {item.actor} -{" "}
                {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
