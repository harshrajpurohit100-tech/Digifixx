"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("pageId");
    } else {
      params.set("pageId", value);
    }
    router.push(`/admin/analytics?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("pageId");
    router.push(`/admin/analytics?${params.toString()}`);
  };

  return (
    <AdminCard padding="md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#0F172A]">
            Landing Page
          </label>
          <p className="text-xs text-[#64748B]">
            Select a landing page to inspect its analytics only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedPageId || "all"}
            onValueChange={handleSelect}
          >
            <SelectTrigger className="w-full sm:w-[320px] rounded-[10px] border-[#E2E8F0] bg-white text-sm focus:ring-0">
              <SelectValue placeholder="Select landing page" />
            </SelectTrigger>
            <SelectContent className="rounded-[10px] border-[#E2E8F0] bg-white shadow-lg">
              <SelectItem value="all" className="text-sm cursor-pointer">
                All Pages Snapshot
              </SelectItem>
              {landingPages.map((page) => (
                <SelectItem
                  key={page.id}
                  value={page.id}
                  className="text-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {page.channel_name || page.internal_name}
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">
                      /p/{page.public_code}
                    </span>
                    <StatusBadge status={page.status} className="h-4 px-1.5 text-[10px] pointer-events-none" />
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPageId && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              className="size-10 shrink-0 rounded-[10px] border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              title="Clear selection"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </AdminCard>
  );
}
