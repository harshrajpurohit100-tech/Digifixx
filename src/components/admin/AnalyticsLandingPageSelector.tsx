"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AnalyticsLandingPageSelectorItem } from "@/types/digifixx";

type AnalyticsLandingPageSelectorProps = {
  landingPages: AnalyticsLandingPageSelectorItem[];
  selectedPageId?: string | null;
};

export function AnalyticsLandingPageSelector({
  landingPages,
  selectedPageId,
}: AnalyticsLandingPageSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = selectedPageId
    ? landingPages.find((p) => p.id === selectedPageId)
    : null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!id) {
      params.delete("pageId");
    } else {
      params.set("pageId", id);
    }
    router.push(`/admin/analytics?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-6">
        {/* Label + helper */}
        <div className="flex-shrink-0">
          <p className="text-[15px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
            Landing Page
          </p>
          <p className="mt-0.5 text-[12px] text-[#64748B]">
            Select a landing page to inspect its analytics.
          </p>
        </div>

        {/* Custom dropdown */}
        <div className="flex items-center gap-2" ref={ref}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-[360px] items-center justify-between gap-3 rounded-[12px] border border-[#E2E8F0] bg-white px-4 text-left text-sm transition-colors hover:bg-[#F8FAFC] focus:outline-none"
            >
              {selected ? (
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="truncate font-semibold text-[#0F172A]">
                    {selected.channel_name || selected.internal_name}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-[#94A3B8]">
                    /p/{selected.public_code}
                  </span>
                  <StatusBadge
                    status={selected.status}
                    className="pointer-events-none h-4 shrink-0 px-1.5 text-[10px]"
                  />
                </div>
              ) : (
                <span className="text-[#94A3B8]">Select landing page…</span>
              )}
              <ChevronDown
                className={`size-4 shrink-0 text-[#94A3B8] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
                {/* All pages option */}
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-[#F8FAFC] ${!selectedPageId ? "bg-[#F5F3FF] font-semibold text-[#7C3AED]" : "text-[#475569]"}`}
                >
                  All Pages Snapshot
                </button>
                <div className="my-0.5 border-t border-[#E2E8F0]" />
                <div className="max-h-[280px] overflow-y-auto">
                  {landingPages.map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => handleSelect(page.id)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[#F8FAFC] ${selectedPageId === page.id ? "bg-[#F5F3FF]" : ""}`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`truncate font-semibold ${selectedPageId === page.id ? "text-[#7C3AED]" : "text-[#0F172A]"}`}
                        >
                          {page.channel_name || page.internal_name}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-[#94A3B8]">
                          /p/{page.public_code}
                        </span>
                      </div>
                      <StatusBadge
                        status={page.status}
                        className="pointer-events-none h-4 shrink-0 px-1.5 text-[10px]"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear button */}
          {selectedPageId && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              title="Clear selection"
              className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-[#E2E8F0] bg-white text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
