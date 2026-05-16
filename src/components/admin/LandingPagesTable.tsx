import { format } from "date-fns";
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
import { getPublicLandingPageUrl } from "@/lib/public-url";
import type { LandingPageAnalyticsSummary, LandingPageWithClientAndTracking } from "@/types/digifixx";

type LandingPagesTableProps = {
  landingPages: LandingPageWithClientAndTracking[];
  analyticsMap?: Record<string, LandingPageAnalyticsSummary>;
};

function formatDate(value: string) {
  return format(new Date(value), "MMM d, yyyy");
}

function LogoThumb({ page }: { page: LandingPageWithClientAndTracking }) {
  if (!page.logo_url) {
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-[#E2E8F0] text-xs font-bold text-[#475569]">
        {(page.channel_name ?? page.internal_name).charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="size-9 rounded-full border border-[#E2E8F0] bg-cover bg-center"
      style={{ backgroundImage: `url(${page.logo_url})` }}
      aria-label={`${page.channel_name ?? page.internal_name} logo`}
    />
  );
}

export function LandingPagesTable({ landingPages, analyticsMap = {} }: LandingPagesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#E2E8F0] hover:bg-transparent">
          {[
            "Public Code",
            "Channel",
            "Client",
            "Status",
            "Pixel",
            "Visits",
            "Conversions",
            "Public URL",
            "Last Updated",
            "Actions",
          ].map((heading) => (
            <TableHead
              key={heading}
              className="h-12 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]"
            >
              {heading}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {landingPages.map((page) => {
          const publicUrl = getPublicLandingPageUrl(page.public_code);

          return (
            <TableRow
              key={page.id}
              className="border-[#E2E8F0] hover:bg-[#F8FAFC]"
            >
              <TableCell className="px-5 py-4 font-mono text-sm font-semibold text-[#0F172A]">
                {page.public_code}
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <LogoThumb page={page} />
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {page.channel_name ?? "Untitled channel"}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {page.internal_name}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-5 py-4 text-sm text-[#475569]">
                {page.client?.name ?? "Unknown client"}
              </TableCell>
              <TableCell className="px-5 py-4">
                <StatusBadge status={page.status} />
              </TableCell>
              <TableCell className="px-5 py-4 text-sm font-medium text-[#0F172A]">
                {analyticsMap[page.id]?.totalVisits ?? 0}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm font-medium text-[#0F172A]">
                {analyticsMap[page.id]?.totalConversions ?? 0}
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#475569]">
                    /p/{page.public_code}
                  </span>
                  <CopyButton value={publicUrl} />
                </div>
              </TableCell>
              <TableCell className="px-5 py-4 text-sm text-[#64748B]">
                {formatDate(page.updated_at)}
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
                  >
                    <Link href={`/admin/landing-pages/${page.id}`}>View</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
                  >
                    <Link href={`/admin/landing-pages/${page.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
