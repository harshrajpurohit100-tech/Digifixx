"use client";

import { Copy, Edit3, Eye, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/admin/CopyButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatIstDate, formatIstTime } from "@/lib/date-format";
import { getPublicLandingPageUrl } from "@/lib/public-url";
import type {
  LandingPageAnalyticsSummary,
  LandingPageWithClientAndTracking,
} from "@/types/digifixx";

type LandingPagesTableProps = {
  landingPages: LandingPageWithClientAndTracking[];
  analyticsMap?: Record<string, LandingPageAnalyticsSummary>;
  totalCount?: number;
};

const tableHeadings = [
  { label: "Public Code", className: "w-[150px]" },
  { label: "Channel", className: "w-[260px]" },
  { label: "Client", className: "w-[150px]" },
  { label: "Status", className: "w-[120px]" },
  { label: "Pixel", className: "w-[90px]" },
  { label: "Visits", className: "w-[90px]" },
  { label: "Conversions", className: "w-[120px]" },
  { label: "Public URL", className: "w-[180px]" },
  { label: "Last Updated", className: "w-[150px]" },
  { label: "Actions", className: "w-[160px] text-right" },
];

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function LogoThumb({ page }: { page: LandingPageWithClientAndTracking }) {
  if (!page.logo_url) {
    return (
      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-xs font-extrabold text-[#7C3AED] ring-1 ring-[#E2E8F0]">
        {(page.channel_name ?? page.internal_name).charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="size-10 rounded-full border border-[#E2E8F0] bg-cover bg-center shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
      style={{ backgroundImage: `url(${page.logo_url})` }}
      aria-label={`${page.channel_name ?? page.internal_name} logo`}
    />
  );
}

function PixelStatus({ isConfigured }: { isConfigured: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold text-[#475569]">
      <span
        className={`size-2 rounded-full ${
          isConfigured
            ? "bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.45)]"
            : "bg-[#CBD5E1]"
        }`}
      />
      {isConfigured ? "On" : "Off"}
    </span>
  );
}

function ActionIconButton({
  icon: Icon,
  label,
  href,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:border-[#BFDBFE] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
    >
      <Link href={href}>
        <Icon data-icon="inline-start" />
        {label}
      </Link>
    </Button>
  );
}

export function LandingPagesTable({
  landingPages,
  analyticsMap = {},
  totalCount = landingPages.length,
}: LandingPagesTableProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <Table className="min-w-[1470px] table-fixed">
          <TableHeader>
            <TableRow className="border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              {tableHeadings.map((heading) => (
                <TableHead
                  key={heading.label}
                  className={`h-12 px-5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#64748B] ${heading.className}`}
                >
                  {heading.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {landingPages.map((page) => {
              const publicUrl = getPublicLandingPageUrl(page.public_code);
              const analytics = analyticsMap[page.id];
              const hasPixel = Boolean(page.tracking_profile?.pixel_id);

              return (
                <TableRow
                  key={page.id}
                  className="h-[72px] border-[#E2E8F0] transition-colors hover:bg-[#F8FAFC]"
                >
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold tracking-[-0.01em] text-[#0F172A]">
                        {page.public_code}
                      </span>
                      <CopyButton
                        value={page.public_code}
                        copiedLabel="OK"
                        ariaLabel="Copy public code"
                        className="size-[30px] rounded-lg border-[#E2E8F0] bg-white p-0 text-[#64748B] shadow-[0_6px_14px_rgba(15,23,42,0.04)] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                      </CopyButton>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <LogoThumb page={page} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0F172A]">
                          {page.channel_name ?? "Untitled channel"}
                        </p>
                        <p className="mt-1 truncate text-xs font-medium text-[#64748B]">
                          {page.internal_name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="truncate px-5 py-3 text-sm font-semibold text-[#334155]">
                    {page.client?.name ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <StatusBadge status={page.status} />
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <PixelStatus isConfigured={hasPixel} />
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-bold text-[#0F172A]">
                    {formatNumber(analytics?.totalVisits ?? 0)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-bold text-[#0F172A]">
                    {formatNumber(analytics?.totalConversions ?? 0)}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[105px] truncate font-mono text-xs font-semibold text-[#475569]">
                        /p/{page.public_code}
                      </span>
                      <CopyButton value={publicUrl} />
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <p className="text-sm font-semibold text-[#334155]">
                      {formatIstDate(page.updated_at)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#64748B]">
                      {formatIstTime(page.updated_at)}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ActionIconButton
                        icon={Eye}
                        label="View"
                        href={`/admin/landing-pages/${page.id}`}
                      />
                      <ActionIconButton
                        icon={Edit3}
                        label="Edit"
                        href={`/admin/landing-pages/${page.id}/edit`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] bg-white px-6 py-4">
        <p className="text-sm font-medium text-[#64748B]">
          Showing {landingPages.length > 0 ? 1 : 0} to {landingPages.length} of{" "}
          {totalCount} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled
            className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#94A3B8]"
          >
            Previous
          </Button>
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#0F172A] text-xs font-bold text-white">
            1
          </span>
          <Button
            type="button"
            variant="outline"
            disabled
            className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#94A3B8]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
