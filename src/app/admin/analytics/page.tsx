import { BarChart3, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/admin/EmptyState";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatCard } from "@/components/admin/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import { getAnalyticsOverview } from "@/lib/repositories/tracking.repository";
import type { AnalyticsOverview } from "@/types/digifixx";

export const dynamic = "force-dynamic";

function formatEventTime(createdAt: string) {
  try {
    return format(new Date(createdAt), "MMM d, HH:mm");
  } catch {
    return createdAt;
  }
}

function ConversionRateBadge({ rate }: { rate: number }) {
  const color = rate >= 10 ? "text-[#16A34A]" : rate >= 3 ? "text-[#D97706]" : "text-[#94A3B8]";
  return <span className={`text-sm font-semibold ${color}`}>{rate.toFixed(2)}%</span>;
}

export default async function AnalyticsPage() {
  const adminUser = await requireAdminUser();
  
  let overview: AnalyticsOverview = {
    totalVisits: 0,
    totalConversions: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    topLandingPages: [],
    recentEvents: [],
  };

  try {
    overview = await getAnalyticsOverview();
  } catch (err) {
    console.error("Failed to load analytics overview", err);
  }

  const hasEvents = overview.recentEvents.length > 0;
  const hasTopPages = overview.topLandingPages.length > 0;

  return (
    <AdminShell
      title="Analytics"
      description="Track visits, conversions, UTM performance, and event delivery."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        {/* Overview Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Visits"
            value={overview.totalVisits.toLocaleString("en-IN")}
            helper="PageView events across all pages"
            icon={Users}
            tone="info"
          />
          <StatCard
            title="Unique Visitors"
            value={overview.uniqueVisitors.toLocaleString("en-IN")}
            helper="Distinct visitor sessions recorded"
            icon={Users}
            tone="default"
          />
          <StatCard
            title="Total Conversions"
            value={overview.totalConversions.toLocaleString("en-IN")}
            helper="Lead, Contact, Subscribe, etc."
            icon={MousePointerClick}
            tone="success"
          />
          <StatCard
            title="Conversion Rate"
            value={`${overview.conversionRate}%`}
            helper="Conversions ÷ total visits"
            icon={TrendingUp}
            tone={overview.conversionRate >= 5 ? "success" : "default"}
          />
        </div>

        {/* Top Pages + Recent Events */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          {/* Top Landing Pages */}
          <AdminCard>
            <SectionHeader
              title="Top Landing Pages"
              description="Sorted by visits. Shows active and paused pages."
            />
            {hasTopPages ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-[#E2E8F0]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                      {["Public Code", "Channel", "Visits", "Conversions", "Conv. Rate"].map((h) => (
                        <TableHead
                          key={h}
                          className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]"
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.topLandingPages.map((p) => (
                      <TableRow key={p.id} className="border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <TableCell className="px-4 py-3 font-mono text-sm font-semibold text-[#0F172A]">
                          {p.public_code}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-[#475569]">
                          {p.channel_name ?? p.internal_name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium text-[#0F172A]">
                          {p.visits.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium text-[#0F172A]">
                          {p.conversions.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <ConversionRateBadge rate={p.conversionRate} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon={BarChart3}
                  title="No analytics yet"
                  description="Open an active public landing page to start collecting analytics."
                />
              </div>
            )}
          </AdminCard>

          {/* Recent Events */}
          <AdminCard>
            <SectionHeader title="Recent Events" />
            {hasEvents ? (
              <div className="mt-5 divide-y divide-[#E2E8F0]">
                {overview.recentEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A]">{ev.event_name}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-[#64748B]">
                        {ev.public_code}
                        {ev.utm_source ? ` · ${ev.utm_source}` : ""}
                      </p>
                      {ev.device_type && (
                        <p className="mt-0.5 text-[11px] capitalize text-[#94A3B8]">{ev.device_type}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-[11px] text-[#94A3B8]">
                      {formatEventTime(ev.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon={BarChart3}
                  title="No events yet"
                  description="Open an active public page to start collecting analytics."
                />
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}
