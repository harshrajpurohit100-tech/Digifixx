import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Eye,
  MousePointerClick,
  PanelsTopLeft,
  Plus,
  Settings2,
  Users,
} from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardStatCard } from "@/components/admin/dashboard/DashboardStatCard";
import { QuickActionTile } from "@/components/admin/dashboard/QuickActionTile";
import { TrackingHealthCard } from "@/components/admin/dashboard/TrackingHealthCard";
import { TrafficOverviewChart } from "@/components/admin/dashboard/TrafficOverviewChart";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import { getDashboardOverview } from "@/lib/repositories/dashboard.repository";

export const dynamic = "force-dynamic";

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

export default async function DashboardPage() {
  const adminUser = await requireAdminUser();
  let overview;

  try {
    overview = await getDashboardOverview();
  } catch (error) {
    console.error("Unable to load dashboard overview", error);

    return (
      <AdminShell
        title="Dashboard"
        description="Overview of your landing pages, traffic, and conversions."
        user={getAdminDisplayUser(adminUser)}
      >
        <AdminCard className="rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="max-w-xl">
            <h2 className="text-lg font-extrabold text-[#0F172A]">
              Unable to load dashboard
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              There was a problem loading live dashboard data. Check Supabase
              configuration, service role access, and database policies.
            </p>
          </div>
        </AdminCard>
      </AdminShell>
    );
  }

  const lastSevenDayVisits = overview.visitsLast7Days.reduce(
    (total, item) => total + item.visits,
    0
  );
  const lastSevenDayConversions = overview.visitsLast7Days.reduce(
    (total, item) => total + item.conversions,
    0
  );

  return (
    <AdminShell
      title="Dashboard"
      description="Overview of your landing pages, traffic, and conversions."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-5">
          <DashboardStatCard
            title="Total Clients"
            value={formatNumber(overview.totalClients)}
            helper="Client records managed"
            icon={Users}
            tone="info"
          />
          <DashboardStatCard
            title="Active Landing Pages"
            value={formatNumber(overview.activeLandingPages)}
            helper="Public pages currently active"
            icon={PanelsTopLeft}
            tone="success"
          />
          <DashboardStatCard
            title="Total Visits"
            value={formatNumber(overview.totalVisits)}
            helper="PageView events across pages"
            icon={Eye}
          />
          <DashboardStatCard
            title="Total Conversions"
            value={formatNumber(overview.totalConversions)}
            helper={`${overview.conversionRate}% average conversion rate`}
            icon={MousePointerClick}
            tone="warning"
          />
        </div>

        <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)] gap-[22px]">
          <AdminCard
            className="overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FAFC_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            padding="lg"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <span className="flex size-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-[0_16px_28px_rgba(37,99,235,0.22)]">
                  <BarChart3 className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0F172A]">
                    Traffic Overview
                  </h2>
                  <p className="mt-1 text-[13px] text-[#64748B]">
                    Visits and conversions from the last 7 days.
                  </p>
                </div>
              </div>
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#475569] shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                <CalendarDays
                  className="size-4 text-[#2563EB]"
                  aria-hidden="true"
                />
                Last 7 Days
                <ChevronDown
                  className="size-3.5 text-[#94A3B8]"
                  aria-hidden="true"
                />
              </span>
            </div>

            <div className="mt-5 flex items-center gap-5 text-xs font-bold text-[#64748B]">
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#2563EB] shadow-[0_0_14px_rgba(37,99,235,0.38)]" />
                Visits
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#16A34A] shadow-[0_0_14px_rgba(22,163,74,0.34)]" />
                Conversions
              </span>
            </div>
            <div className="mt-4">
              <TrafficOverviewChart data={overview.visitsLast7Days} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                    <Eye className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#64748B]">
                      Total Visits
                    </p>
                    <p className="mt-1 text-xl font-extrabold leading-none text-[#020617]">
                      {formatNumber(lastSevenDayVisits)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-[#94A3B8]">
                  Last 7 days
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#ECFDF5] text-[#16A34A]">
                    <MousePointerClick className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#64748B]">
                      Total Conversions
                    </p>
                    <p className="mt-1 text-xl font-extrabold leading-none text-[#020617]">
                      {formatNumber(lastSevenDayConversions)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-[#94A3B8]">
                  Last 7 days
                </p>
              </div>
            </div>
          </AdminCard>

          <div className="flex flex-col gap-5">
            <AdminCard
              className="rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
              padding="lg"
            >
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0F172A]">
                  Quick Actions
                </h2>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  Common actions for managing your pages.
                </p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <QuickActionTile
                  title="Create Client"
                  helper="Add a new client workspace."
                  href="/admin/clients/new"
                  icon={Users}
                  tone="purple"
                />
                <QuickActionTile
                  title="Create Landing Page"
                  helper="Build a coded Telegram landing page."
                  href="/admin/landing-pages/new"
                  icon={Plus}
                  tone="green"
                />
                <QuickActionTile
                  title="View Analytics"
                  helper="Inspect page-specific performance."
                  href="/admin/analytics"
                  icon={BarChart3}
                  tone="blue"
                />
                <QuickActionTile
                  title="Manage Landing Pages"
                  helper="Edit, pause, or archive public pages."
                  href="/admin/landing-pages"
                  icon={Settings2}
                  tone="orange"
                />
              </div>
            </AdminCard>

            <TrackingHealthCard health={overview.trackingHealth} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
