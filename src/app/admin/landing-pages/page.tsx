import { FileText, Plus } from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/admin/EmptyState";
import { LandingPagesTable } from "@/components/admin/LandingPagesTable";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import { listLandingPagesWithClientAndTracking } from "@/lib/repositories/landing-pages.repository";
import { getLandingPagesAnalyticsMap } from "@/lib/repositories/tracking.repository";
import type {
  LandingPageAnalyticsSummary,
  LandingPageStatus,
  LandingPageWithClientAndTracking,
} from "@/types/digifixx";

export const dynamic = "force-dynamic";

type SummaryCardProps = {
  label: string;
  value: number;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <AdminCard className="min-h-[96px]" padding="md">
      <p className="text-[13px] font-medium text-[#64748B]">{label}</p>
      <p className="mt-3 text-[26px] font-bold leading-none tracking-tight text-[#0F172A]">
        {value}
      </p>
    </AdminCard>
  );
}

function getPageCountByStatus(
  pages: LandingPageWithClientAndTracking[],
  status: LandingPageStatus
) {
  return pages.filter((page) => page.status === status).length;
}

function LandingPageLoadError() {
  return (
    <AdminCard>
      <div className="max-w-xl">
        <h2 className="text-lg font-bold text-[#0F172A]">
          Unable to load landing pages
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          There was a problem loading landing page data. Check Supabase
          configuration and RLS policies.
        </p>
      </div>
    </AdminCard>
  );
}

export default async function LandingPagesPage() {
  const adminUser = await requireAdminUser();
  let landingPages: LandingPageWithClientAndTracking[] = [];
  let analyticsMap: Record<string, LandingPageAnalyticsSummary> = {};
  let hasLoadError = false;

  try {
    landingPages = await listLandingPagesWithClientAndTracking();
    if (landingPages.length > 0) {
      analyticsMap = await getLandingPagesAnalyticsMap(
        landingPages.map((p) => p.id)
      );
    }
  } catch (error) {
    console.error("Unable to load landing pages", error);
    hasLoadError = true;
  }

  return (
    <AdminShell
      title="Landing Pages"
      description="Create coded Telegram landing pages with separate client tracking and Meta CAPI configuration."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Landing Pages"
          description="Create coded Telegram landing pages with separate client tracking and Meta CAPI configuration."
          action={
            <Button
              asChild
              className="h-[38px] rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <Link href="/admin/landing-pages/new">
                <Plus data-icon="inline-start" />
                Create Landing Page
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Total Pages" value={landingPages.length} />
          <SummaryCard
            label="Active"
            value={getPageCountByStatus(landingPages, "active")}
          />
          <SummaryCard
            label="Draft"
            value={getPageCountByStatus(landingPages, "draft")}
          />
          <SummaryCard
            label="Paused"
            value={getPageCountByStatus(landingPages, "paused")}
          />
        </div>

        {hasLoadError ? (
          <LandingPageLoadError />
        ) : (
          <AdminCard padding="none">
            <div className="border-b border-[#E2E8F0] p-5">
              <h2 className="text-lg font-bold leading-tight text-[#0F172A]">
                Landing Page Directory
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
                Public coded pages generated for clients and Telegram
                campaigns.
              </p>
            </div>
            {landingPages.length > 0 ? (
              <LandingPagesTable landingPages={landingPages} analyticsMap={analyticsMap} />
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={FileText}
                  title="No landing pages yet"
                  description="Create your first coded Telegram landing page and connect its Meta tracking profile."
                  action={
                    <Button
                      asChild
                      className="h-[38px] rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                    >
                      <Link href="/admin/landing-pages/new">
                        <Plus data-icon="inline-start" />
                        Create Landing Page
                      </Link>
                    </Button>
                  }
                />
              </div>
            )}
          </AdminCard>
        )}
      </div>
    </AdminShell>
  );
}
