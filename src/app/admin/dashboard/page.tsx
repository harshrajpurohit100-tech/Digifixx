import {
  BarChart3,
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
import { RecentActivityCard } from "@/components/admin/dashboard/RecentActivityCard";
import { TopLandingPagesCard } from "@/components/admin/dashboard/TopLandingPagesCard";
import { TrackingHealthCard } from "@/components/admin/dashboard/TrackingHealthCard";
import { TrafficOverviewChart } from "@/components/admin/dashboard/TrafficOverviewChart";
import { SectionHeader } from "@/components/admin/SectionHeader";
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
  const overview = await getDashboardOverview();

  return (
    <AdminShell
      title="Dashboard"
      description="Overview of your landing pages, traffic, and conversions."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Clients"
            value={formatNumber(overview.totalClients)}
            helper="Client records managed in Digifixx"
            icon={Users}
            tone="info"
          />
          <DashboardStatCard
            title="Active Landing Pages"
            value={formatNumber(overview.activeLandingPages)}
            helper="Public pages currently available"
            icon={PanelsTopLeft}
            tone="success"
          />
          <DashboardStatCard
            title="Total Visits"
            value={formatNumber(overview.totalVisits)}
            helper="PageView events across public pages"
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

        <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(360px,0.95fr)] gap-5">
          <AdminCard className="rounded-[18px]">
            <SectionHeader
              title="Traffic Overview"
              description="Visits and conversions from the last 7 days."
            />
            <div className="mt-5">
              <TrafficOverviewChart data={overview.visitsLast7Days} />
            </div>
            <div className="mt-5 flex items-center gap-5 text-xs font-semibold text-[#64748B]">
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#2563EB]" />
                Visits
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#16A34A]" />
                Conversions
              </span>
            </div>
          </AdminCard>

          <RecentActivityCard events={overview.recentEvents} />
        </div>

        <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(360px,0.95fr)] gap-5">
          <TopLandingPagesCard pages={overview.topLandingPages} />

          <div className="flex flex-col gap-5">
            <AdminCard className="rounded-[18px]">
              <SectionHeader
                title="Quick Actions"
                description="Common admin tasks for day-to-day page management."
              />
              <div className="mt-5 grid gap-3">
                <QuickActionTile
                  title="Create Client"
                  helper="Add a new client workspace."
                  href="/admin/clients/new"
                  icon={Users}
                />
                <QuickActionTile
                  title="Create Landing Page"
                  helper="Build a coded Telegram landing page."
                  href="/admin/landing-pages/new"
                  icon={Plus}
                />
                <QuickActionTile
                  title="View Analytics"
                  helper="Inspect page-specific performance."
                  href="/admin/analytics"
                  icon={BarChart3}
                />
                <QuickActionTile
                  title="Manage Landing Pages"
                  helper="Edit, pause, or archive public pages."
                  href="/admin/landing-pages"
                  icon={Settings2}
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
