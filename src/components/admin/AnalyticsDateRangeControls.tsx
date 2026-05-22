"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { analyticsDatePresets } from "@/lib/analytics/date-range";
import type { AnalyticsDatePreset } from "@/types/digifixx";

type AnalyticsDateRangeControlsProps = {
  preset: AnalyticsDatePreset;
  from?: string;
  to?: string;
  hiddenFields?: Record<string, string | number | null | undefined>;
};

export function AnalyticsDateRangeControls({
  preset,
  from,
  to,
  hiddenFields,
}: AnalyticsDateRangeControlsProps) {
  const [selectedPreset, setSelectedPreset] =
    useState<AnalyticsDatePreset>(preset);

  return (
    <form
      action="/admin/analytics"
      className="flex flex-wrap items-end justify-end gap-2"
    >
      {Object.entries(hiddenFields ?? {}).map(([key, value]) =>
        value === null || value === undefined || value === "" ? null : (
          <input key={key} type="hidden" name={key} value={String(value)} />
        )
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          Date Range
        </span>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <select
            name="preset"
            value={selectedPreset}
            onChange={(event) =>
              setSelectedPreset(event.target.value as AnalyticsDatePreset)
            }
            className="h-10 w-[178px] rounded-[12px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[13px] font-semibold text-[#0F172A] outline-none transition-colors focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
          >
            {analyticsDatePresets.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </label>

      {selectedPreset === "custom" && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
              From
            </span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="h-10 rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none transition-colors focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
              To
            </span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="h-10 rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none transition-colors focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
            />
          </label>
        </>
      )}

      <button
        type="submit"
        className="h-10 rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#334155]"
      >
        Apply
      </button>
    </form>
  );
}
