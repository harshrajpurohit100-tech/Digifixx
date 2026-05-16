"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[272px] shrink-0 overflow-y-auto overflow-x-hidden bg-[#020617] px-4 py-5">
      <div className="pointer-events-none absolute -left-20 top-0 size-56 rounded-full bg-[#2563EB]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 size-64 rounded-full bg-[#7C3AED]/15 blur-3xl" />

      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-1">
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-sm font-extrabold text-white shadow-[0_0_28px_rgba(37,99,235,0.35)]">
            D
          </div>
          <div>
            <p className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-white">
              Digifixx
            </p>
          </div>
        </Link>

        <nav className="mt-8 flex flex-col gap-1.5" aria-label="Admin navigation">
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
                  "relative flex h-[44px] items-center gap-2.5 rounded-[12px] border px-3 text-sm font-semibold transition-all duration-200 ease-out",
                  isActive
                    ? "border-[rgba(59,130,246,0.35)] bg-[linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.78))] text-white shadow-[0_0_28px_rgba(37,99,235,0.20)]"
                    : "border-transparent text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white"
                )}
              >
                {isActive ? (
                  <span className="absolute right-3 size-1.5 rounded-full bg-[#60A5FA] shadow-[0_0_16px_rgba(96,165,250,0.90)]" />
                ) : null}
                <Icon
                  className={cn(
                    "size-[18px]",
                    isActive ? "text-[#DBEAFE]" : "text-[#94A3B8]"
                  )}
                  aria-hidden="true"
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <section className="rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-extrabold text-white">
              H
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-4 text-[#F8FAFC]">
                Digifixx Admin
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-[#94A3B8]">
                Personal control panel
              </p>
            </div>
            <span className="rounded-full border border-[#60A5FA]/30 bg-[#2563EB]/15 px-2 py-1 text-[10px] font-bold text-[#93C5FD]">
              Dev
            </span>
          </div>
        </section>
      </div>
    </aside>
  );
}
