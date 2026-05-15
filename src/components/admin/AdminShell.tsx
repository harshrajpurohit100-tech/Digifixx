import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { DesktopOnlyGuard } from "@/components/admin/DesktopOnlyGuard";

type AdminShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export function AdminShell({ children, title, description }: AdminShellProps) {
  return (
    <DesktopOnlyGuard>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar title={title} description={description} />
          <main className="min-w-0 flex-1 p-7">{children}</main>
        </div>
      </div>
    </DesktopOnlyGuard>
  );
}
