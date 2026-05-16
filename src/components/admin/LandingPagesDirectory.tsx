"use client";

import {
  FileText,
  ListFilter,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminCard } from "@/components/admin/AdminCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { LandingPagesTable } from "@/components/admin/LandingPagesTable";
import { Button } from "@/components/ui/button";
import type {
  LandingPageAnalyticsSummary,
  LandingPageWithClientAndTracking,
} from "@/types/digifixx";

type LandingPagesDirectoryProps = {
  landingPages: LandingPageWithClientAndTracking[];
  analyticsMap: Record<string, LandingPageAnalyticsSummary>;
};

function CreateLandingPageButton() {
  return (
    <Button
      asChild
      className="h-[42px] rounded-[12px] bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:from-[#1D4ED8] hover:to-[#6D28D9] hover:shadow-[0_16px_30px_rgba(37,99,235,0.28)]"
    >
      <Link href="/admin/landing-pages/new">
        <Plus data-icon="inline-start" />
        Create Landing Page
      </Link>
    </Button>
  );
}

function pageMatchesSearch(
  page: LandingPageWithClientAndTracking,
  normalizedQuery: string
) {
  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    page.public_code,
    page.channel_name,
    page.internal_name,
    page.client?.name,
  ].filter((value): value is string => Boolean(value));

  return searchableValues.some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  );
}

export function LandingPagesDirectory({
  landingPages,
  analyticsMap,
}: LandingPagesDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLandingPages = useMemo(
    () =>
      landingPages.filter((page) => pageMatchesSearch(page, normalizedQuery)),
    [landingPages, normalizedQuery]
  );

  return (
    <AdminCard
      className="overflow-hidden rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      padding="none"
    >
      <div className="flex items-start justify-between gap-5 border-b border-[#E2E8F0] p-5">
        <div className="flex items-start gap-3.5">
          <span className="flex size-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#F5F3FF] to-[#EFF6FF] text-[#7C3AED]">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0F172A]">
              Landing Page Directory
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
              Manage and monitor all your public landing pages.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <CreateLandingPageButton />
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by page name, code, or client..."
              className="h-11 w-[260px] rounded-[12px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#BFDBFE] 2xl:w-[320px]"
              aria-label="Search landing pages"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[12px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          >
            <SlidersHorizontal data-icon="inline-start" />
            Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            className="size-11 rounded-[12px] border-[#E2E8F0] bg-white p-0 text-[#64748B] hover:bg-[#F8FAFC]"
            aria-label="View options"
          >
            <ListFilter className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {landingPages.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={Send}
            title="No landing pages yet"
            description="Create your first coded Telegram landing page and connect its tracking profile."
            action={<CreateLandingPageButton />}
          />
        </div>
      ) : filteredLandingPages.length > 0 ? (
        <LandingPagesTable
          landingPages={filteredLandingPages}
          analyticsMap={analyticsMap}
          totalCount={landingPages.length}
        />
      ) : (
        <div className="p-5">
          <EmptyState
            icon={Search}
            title="No matching landing pages"
            description="Try searching by public code, channel name, page name, or client."
          />
        </div>
      )}
    </AdminCard>
  );
}
