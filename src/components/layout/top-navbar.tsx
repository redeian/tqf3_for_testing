"use client";

import Link from "next/link";

const topLinks = [
  { href: "/syllabi", label: "รายชื่อวิชา", active: true },
  { href: "#", label: "แผนการเรียน", active: false },
  { href: "#", label: "Reports", active: false },
];

export function TopNavbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface border-b border-outline-variant shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-headline-md font-bold text-primary">
          UTCC TQF3 Manager
        </Link>
        <div className="hidden md:flex gap-6 text-body-md">
          {topLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "text-secondary font-bold border-b-2 border-secondary transition-colors duration-200"
                  : "text-on-surface-variant hover:text-secondary transition-colors duration-200"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all">
          Faculty Dashboard
        </button>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
          notifications
        </span>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
          help
        </span>
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border border-outline-variant overflow-hidden">
          <span className="material-symbols-outlined text-on-primary-container">
            person
          </span>
        </div>
      </div>
    </nav>
  );
}
