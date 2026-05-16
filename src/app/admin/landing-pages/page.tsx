import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  FileText,
  type LucideIcon,
  PauseCircle,
} from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { LandingPagesDirectory } from "@/components/admin/LandingPagesDirectory";
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
  helper: string;
  tone: "total" | "active" | "paused" | "archived";
  icon: LucideIcon;
};

const summaryToneClasses = {
  total: {
    icon: "bg-[#F5F3FF] text-[#7C3AED]",
    accent: "from-[#7C3AED] to-[#2563EB]",
  },
  active: {
    icon: "bg-[#ECFDF5] text-[#16A34A]",
    accent: "from-[#16A34A] to-[#22C55E]",
  },
  paused: {
    icon: "bg-[#FFF7ED] text-[#EA580C]",
    accent: "from-[#EA580C] to-[#FDBA74]",
  },
  archived: {
    icon: "bg-[#F1F5F9] text-[#64748B]",
    accent: "from-[#94A3B8] to-[#CBD5E1]",
  },
};

function SummaryCard({
  label,
  value,
  helper,
  tone,
  icon: Icon,
}: SummaryCardProps) {
  const classes = summaryToneClasses[tone];

  return (
    <section className="group relative min-h-[136px] overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[#DBEAFE] hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-[#7C3AED]/[0.05] blur-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-[18px] shadow-[0_16px_30px_rgba(37,99,235,0.12)] transition-transform duration-200 group-hover:scale-[1.04] ${classes.icon}`}
        >
          <Icon className="size-[26px]" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-[#0F172A]">{label}</p>
          <p className="mt-2 text-[30px] font-extrabold leading-none tracking-[-0.02em] text-[#020617]">
            {value.toLocaleString("en-IN")}
          </p>
          <p className="mt-3 text-[13px] font-medium text-[#64748B]">
            {helper}
          </p>
        </div>
      </div>
      <div
        className={`absolute inset-x-5 bottom-0 h-1 rounded-t-full bg-gradient-to-r ${classes.accent}`}
      />
    </section>
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
    <AdminCard className="rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex max-w-2xl items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[15px] bg-[#FEF2F2] text-[#DC2626]">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Unable to load landing pages
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            There was a problem loading landing page data. Check Supabase
            configuration and RLS policies.
          </p>
        </div>
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
      description="Create coded Telegram landing pages with separate tracking and Meta CAPI configuration."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="relative flex flex-col gap-5">
        <div className="pointer-events-none absolute right-0 top-0 -z-10 size-[360px] rounded-full bg-[#7C3AED]/[0.08] blur-3xl" />

        <div className="grid grid-cols-4 gap-5">
          <SummaryCard
            label="Total Pages"
            value={landingPages.length}
            helper="All landing pages"
            tone="total"
            icon={FileText}
          />
          <SummaryCard
            label="Active"
            value={getPageCountByStatus(landingPages, "active")}
            helper="Currently active pages"
            tone="active"
            icon={CheckCircle2}
          />
          <SummaryCard
            label="Paused"
            value={getPageCountByStatus(landingPages, "paused")}
            helper="Paused pages"
            tone="paused"
            icon={PauseCircle}
          />
          <SummaryCard
            label="Archived"
            value={getPageCountByStatus(landingPages, "archived")}
            helper="Archived pages"
            tone="archived"
            icon={Archive}
          />
        </div>

        {hasLoadError ? (
          <LandingPageLoadError />
        ) : (
          <LandingPagesDirectory
            landingPages={landingPages}
            analyticsMap={analyticsMap}
          />
        )}
      </div>
    </AdminShell>
  );
}
