import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { DesktopOnlyGuard } from "@/components/admin/DesktopOnlyGuard";

type AdminShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export function AdminShell({
  children,
  title,
  description,
  user,
}: AdminShellProps) {
  return (
    <DesktopOnlyGuard>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <AdminSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 size-[420px] rounded-full bg-[#2563EB]/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute right-40 top-10 size-[360px] rounded-full bg-[#7C3AED]/[0.05] blur-3xl" />
          <AdminTopbar title={title} description={description} user={user} />
          <main className="relative min-w-0 flex-1 p-7">{children}</main>
        </div>
      </div>
    </DesktopOnlyGuard>
  );
}
