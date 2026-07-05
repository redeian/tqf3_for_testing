export function DashboardTips() {
  return (
    <div className="md:col-span-2 bg-gradient-to-br from-primary to-[#004a8d] p-8 rounded-2xl text-on-primary flex items-center justify-between shadow-lg">
      <div className="flex flex-col gap-2">
        <h3 className="text-headline-sm">ต้องการความช่วยเหลือ?</h3>
        <p className="text-body-md opacity-90 max-w-lg">
          คู่มือการกรอกข้อมูล มคอ. 3 ตามมาตรฐาน TQF ปีการศึกษาใหม่
          พร้อมเทมเพลตแนะนำในหัวข้อที่ 5: แผนการสอนและการประเมินผล
        </p>
        <div className="flex gap-4 mt-4">
          <button className="px-6 py-2 bg-white text-primary rounded-lg text-label-md hover:bg-secondary-fixed transition-colors">
            ดาวน์โหลดคู่มือ
          </button>
          <button className="px-6 py-2 border border-on-primary/30 rounded-lg text-label-md hover:bg-white/10 transition-colors">
            ติดต่อฝ่ายวิชาการ
          </button>
        </div>
      </div>
      <span className="material-symbols-outlined text-[80px] opacity-20 hidden md:block">
        menu_book
      </span>
    </div>
  );
}
