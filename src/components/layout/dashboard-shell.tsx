import { TopNavbar } from "./top-navbar";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavbar />
      <Sidebar />
      <main className="lg:pl-64 pt-[80px] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6 py-8">{children}</div>
      </main>
    </>
  );
}
