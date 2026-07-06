"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionResult } from "@/lib/types";

type SyllabusSummary = {
  id: string;
  courseCode: string;
  courseName: string;
  createdAt: Date;
};

type SyllabusTableProps = {
  syllabi: SyllabusSummary[];
  onDelete: (id: string) => Promise<ActionResult<void>>;
};

export function SyllabusTable({ syllabi, onDelete }: SyllabusTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-primary text-on-primary">
            <tr>
              <th className="px-6 py-3 text-label-md">รหัสวิชา</th>
              <th className="px-6 py-3 text-label-md">ชื่อวิชา</th>
              <th className="px-6 py-3 text-label-md">หมวดวิชา</th>
              <th className="px-6 py-3 text-label-md text-center">สถานะ</th>
              <th className="px-6 py-3 text-label-md text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {syllabi.map((syllabus, index) => (
              <tr
                key={syllabus.id}
                className="hover:bg-surface-container-low transition-colors group"
              >
                <td className="px-6 py-5 text-body-md font-bold text-primary">
                  {syllabus.courseCode}
                </td>
                <td className="px-6 py-5">
                  <Link
                    href={`/syllabi/${syllabus.id}`}
                    className="flex flex-col"
                  >
                    <span className="text-body-md text-on-surface font-semibold">
                      {syllabus.courseName}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      —
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-5 text-body-sm text-on-surface-variant">
                  วิชาบังคับเอก
                </td>
                <td className="px-6 py-5 text-center">
                  <StatusBadge
                    status={
                      index === 1 ? "completed" : index === 2 ? "incomplete" : "draft"
                    }
                  />
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 group-hover:md:opacity-100">
                    <Link
                      href={`/syllabi/${syllabus.id}?edit=1`}
                      className="p-2 text-secondary hover:bg-secondary-container/30 rounded-lg transition-colors"
                      title="แก้ไข"
                      aria-label="Edit"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                    <Link
                      href={`/syllabi/${syllabus.id}`}
                      className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </Link>
                    <button
                      onClick={() => onDelete(syllabus.id)}
                      className="p-2 text-error hover:bg-error-container/30 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
        <span className="text-body-sm text-on-surface-variant">
          Showing 1 to {syllabi.length} of {syllabi.length} subjects
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="p-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant disabled:opacity-50"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="px-3 py-1 rounded-lg bg-primary text-on-primary text-label-md">
            1
          </button>
          <button className="px-3 py-1 rounded-lg hover:bg-surface-container-highest text-label-md transition-colors">
            2
          </button>
          <button className="px-3 py-1 rounded-lg hover:bg-surface-container-highest text-label-md transition-colors">
            3
          </button>
          <span className="px-1 text-on-surface-variant">...</span>
          <button className="px-3 py-1 rounded-lg hover:bg-surface-container-highest text-label-md transition-colors">
            6
          </button>
          <button className="p-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
