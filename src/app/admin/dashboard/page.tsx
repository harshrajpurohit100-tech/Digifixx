import {
  CheckCircle2,
  Clock3,
  Eye,
  MousePointerClick,
  PanelsTopLeft,
  Users,
} from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const activityRows = [
  {
    text: "Landing page code A8xK92LmQ received 284 visits today",
    time: "2 min ago",
  },
  {
    text: "Client Nova Media updated tracking profile",
    time: "18 min ago",
  },
  {
    text: "CAPI event delivery recovered for Pixel 2849•••129",
    time: "42 min ago",
  },
  {
    text: "New landing page P7mQ2xLpB published",
    time: "1 hr ago",
  },
];

const quickActions = [
  { label: "Create Client", href: "/admin/clients" },
  { label: "Create Landing Page", href: "/admin/landing-pages" },
  { label: "View Analytics", href: "/admin/analytics" },
  { label: "Open Settings", href: "/admin/settings" },
];

const healthItems = [
  { label: "Admin UI", status: "Ready", tone: "success" },
  { label: "Supabase", status: "Not connected in Phase 1", tone: "muted" },
  { label: "Meta CAPI", status: "Not configured in Phase 1", tone: "muted" },
  { label: "Public Pages", status: "Pending", tone: "warning" },
];

function StatusBadge({ status, tone }: { status: string; tone: string }) {
  const className =
    tone === "success"
      ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#16A34A]"
      : tone === "warning"
        ? "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]"
        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]";

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

export default function DashboardPage() {
  return (
    <AdminShell
      title="Dashboard"
      description="Operational overview for clients, landing pages, tracking, and conversions."
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value="12"
            helper="3 clients added this month"
            icon={Users}
            tone="info"
          />
          <StatCard
            title="Active Landing Pages"
            value="48"
            helper="42 active, 6 paused"
            icon={PanelsTopLeft}
            tone="success"
          />
          <StatCard
            title="Total Visits"
            value="128,430"
            helper="Across all public pages"
            icon={Eye}
          />
          <StatCard
            title="Total Conversions"
            value="19,842"
            helper="15.45% average conversion rate"
            icon={MousePointerClick}
            tone="warning"
          />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <AdminCard>
            <SectionHeader title="Recent Activity" />
            <div className="mt-5 divide-y divide-[#E2E8F0]">
              {activityRows.map((row) => (
                <div
                  key={row.text}
                  className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569]">
                      <Clock3 className="size-4" aria-hidden="true" />
                    </span>
                    <p className="truncate text-sm font-medium text-[#0F172A]">
                      {row.text}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-[#94A3B8]">{row.time}</p>
                </div>
              ))}
            </div>
          </AdminCard>

          <div className="flex flex-col gap-4">
            <AdminCard>
              <SectionHeader title="Quick Actions" />
              <div className="mt-5 grid gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.href}
                    asChild
                    variant="outline"
                    className="h-9 justify-start rounded-[10px] border-[#E2E8F0] bg-white text-[#0F172A]"
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            </AdminCard>

            <AdminCard>
              <SectionHeader title="System Health" />
              <div className="mt-5 flex flex-col gap-3">
                {healthItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="size-4 text-[#64748B]"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-[#0F172A]">
                        {item.label}
                      </span>
                    </div>
                    <StatusBadge status={item.status} tone={item.tone} />
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
