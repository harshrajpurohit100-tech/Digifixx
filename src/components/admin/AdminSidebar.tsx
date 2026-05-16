"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[272px] shrink-0 flex-col bg-[#0F172A] px-4 py-5">
      <Link href="/admin/dashboard" className="flex items-center gap-3 px-1">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#2563EB] text-sm font-extrabold text-white">
          D
        </div>
        <div>
          <p className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-white">
            Digifixx
          </p>
          <p className="mt-1 text-xs leading-4 text-[#94A3B8]">
            Telegram Landing Pages
          </p>
        </div>
      </Link>

      <nav className="mt-7 flex flex-col gap-1" aria-label="Admin navigation">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-[42px] items-center gap-2.5 rounded-[10px] px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1E293B] text-white"
                  : "text-[#CBD5E1] hover:bg-[#172033] hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "size-[18px]",
                  isActive ? "text-white" : "text-[#94A3B8]"
                )}
                aria-hidden="true"
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <section className="rounded-[14px] border border-white/[0.08] bg-[#111827] p-3.5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">
            Workspace
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[#F8FAFC]">
            Digifixx HQ
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8]">
              Environment
            </p>
            <p className="mt-1 text-[13px] font-semibold text-[#F8FAFC]">
              Development
            </p>
          </div>
          <span className="rounded-full bg-[rgba(37,99,235,0.16)] px-2.5 py-1 text-[11px] font-semibold text-[#93C5FD]">
            Development
          </span>
        </div>
      </section>
    </aside>
  );
}
