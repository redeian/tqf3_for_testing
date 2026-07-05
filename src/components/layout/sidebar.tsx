"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/syllabi", label: "All Subjects", icon: "library_books" },
  { href: "/syllabi/new", label: "Create New Syllabus", icon: "add_box" },
  { href: "#", label: "Teaching Plans", icon: "calendar_today" },
  { href: "#", label: "Reports", icon: "assessment" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 pt-[80px] bg-surface-container-low border-r border-outline-variant shadow-sm z-40 py-6">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined material-symbols-filled text-on-primary text-[18px]">
              school
            </span>
          </div>
          <span className="text-headline-sm font-bold text-primary">
            Thai University
          </span>
        </div>
        <p className="text-on-surface-variant text-label-md opacity-70">
          Academic Portal
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-4 py-2 text-label-md active:scale-95 transition-transform " +
                (active
                  ? "bg-secondary-container text-on-secondary-container shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200")
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 mt-auto space-y-1">
        <Link
          href="#"
          className="w-full block bg-primary text-on-primary rounded-lg py-2 px-4 mb-4 text-label-md shadow-md hover:bg-opacity-90 active:scale-95 transition-all text-center"
        >
          Export All มคอ.3
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200 px-4 py-2 rounded-lg text-label-md"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 text-error hover:bg-error-container transition-all duration-200 px-4 py-2 rounded-lg text-label-md"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}
