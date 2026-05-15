import {
  BarChart3,
  CheckCircle2,
  MousePointerClick,
  Send,
  Users,
} from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatCard } from "@/components/admin/StatCard";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";

export const dynamic = "force-dynamic";

const eventRows = [
  { event: "PageView", code: "A8xK92LmQ", time: "12 seconds ago" },
  { event: "Lead", code: "P7mQ2xLpB", time: "44 seconds ago" },
  { event: "Contact", code: "A8xK92LmQ", time: "1 minute ago" },
  { event: "PageView", code: "V8zR42AkL", time: "3 minutes ago" },
];

const topPages = [
  { code: "A8xK92LmQ", visits: "12,842", rate: "16.38%" },
  { code: "P7mQ2xLpB", visits: "8,390", rate: "15.35%" },
  { code: "V8zR42AkL", visits: "3,219", rate: "12.49%" },
  { code: "Q5nT81BxC", visits: "0", rate: "0.00%" },
];

export default async function AnalyticsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      title="Analytics"
      description="Track visits, conversions, UTM performance, and event delivery."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Visits Today"
            value="6,842"
            helper="Across active public pages"
            icon={Users}
            tone="info"
          />
          <StatCard
            title="Click Events"
            value="1,934"
            helper="Tracked button and link clicks"
            icon={MousePointerClick}
            tone="default"
          />
          <StatCard
            title="Lead Events"
            value="982"
            helper="Submitted lead actions"
            icon={Send}
            tone="success"
          />
          <StatCard
            title="CAPI Success"
            value="98.7%"
            helper="Placeholder delivery health"
            icon={CheckCircle2}
            tone="success"
          />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <AdminCard>
            <SectionHeader title="Traffic and Conversions" />
            <div className="mt-5 flex h-80 items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
              <div className="text-center">
                <BarChart3
                  className="mx-auto size-9 text-[#94A3B8]"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-medium text-[#64748B]">
                  Chart will be connected after analytics tracking is
                  implemented.
                </p>
              </div>
            </div>
          </AdminCard>

          <div className="flex flex-col gap-4">
            <AdminCard>
              <SectionHeader title="Live Event Stream" />
              <div className="mt-5 divide-y divide-[#E2E8F0]">
                {eventRows.map((row) => (
                  <div
                    key={`${row.event}-${row.code}-${row.time}`}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {row.event}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[#64748B]">
                        {row.code}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-[#94A3B8]">
                      {row.time}
                    </p>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard>
              <SectionHeader title="Top Landing Pages" />
              <div className="mt-5 flex flex-col gap-3">
                {topPages.map((page) => (
                  <div
                    key={page.code}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4"
                  >
                    <span className="font-mono text-sm font-semibold text-[#0F172A]">
                      {page.code}
                    </span>
                    <span className="text-sm text-[#475569]">
                      {page.visits}
                    </span>
                    <span className="text-sm font-semibold text-[#16A34A]">
                      {page.rate}
                    </span>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
