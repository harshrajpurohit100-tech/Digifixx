import {
  BarChart3,
  CalendarDays,
  CheckCircle,
  Eye,
  ExternalLink,
  Globe,
  HelpCircle,
  Monitor,
  MousePointerClick,
  PanelTop,
  Percent,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AnalyticsLandingPageSelector } from "@/components/admin/AnalyticsLandingPageSelector";
import { Button } from "@/components/ui/button";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import {
  getAnalyticsOverview,
  getLandingPageAnalyticsDetail,
  listLandingPagesForAnalyticsSelector,
} from "@/lib/repositories/tracking.repository";
import { getLandingPageById } from "@/lib/repositories/landing-pages.repository";
import type {
  AnalyticsOverview,
  CapiDeliveryStatus,
  LandingPageAnalyticsDetail,
} from "@/types/digifixx";

export const dynamic = "force-dynamic";

/* ── helpers ── */
function formatEventTime(createdAt: string) {
  try {
    return format(new Date(createdAt), "MMM d, HH:mm");
  } catch {
    return createdAt;
  }
}

function safeHostname(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname;
  } catch {
    return "Direct";
  }
}

/* ── KPI metric card ── */
function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)]" style={{ minHeight: "112px" }}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">{label}</p>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-[12px] ${iconBg}`}>
          <Icon className={`size-[18px] ${iconColor}`} aria-hidden="true" />
        </div>
      </div>
      <div>
        <p className="text-[26px] font-extrabold leading-none tracking-[-0.03em] text-[#0F172A]">{value}</p>
        <p className="mt-1.5 text-[12px] text-[#94A3B8]">{helper}</p>
      </div>
    </div>
  );
}

/* ── Card section header ── */
function CardHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-[12px] ${iconBg}`}>
        <Icon className={`size-[18px] ${iconColor}`} aria-hidden="true" />
      </div>
      <div>
        <p className="text-[15px] font-extrabold tracking-[-0.01em] text-[#0F172A]">{title}</p>
        {subtitle && <p className="mt-0.5 text-[12px] text-[#64748B]">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── CAPI status badge ── */
function CapiBadge({ status }: { status: CapiDeliveryStatus }) {
  const styles: Record<CapiDeliveryStatus, { dot: string; bg: string; text: string; label: string }> = {
    sent: { dot: "bg-[#10B981]", bg: "bg-[#ECFDF5]", text: "text-[#166534]", label: "Sent" },
    failed: { dot: "bg-[#EF4444]", bg: "bg-[#FEF2F2]", text: "text-[#B91C1C]", label: "Failed" },
    skipped: { dot: "bg-[#94A3B8]", bg: "bg-[#F8FAFC]", text: "text-[#475569]", label: "Skipped" },
    pending: { dot: "bg-[#F59E0B]", bg: "bg-[#FFFBEB]", text: "text-[#92400E]", label: "Pending" },
    not_sent: { dot: "bg-[#CBD5E1]", bg: "bg-white", text: "text-[#64748B]", label: "Not Sent" },
  };
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ── Device icon ── */
function DeviceIcon({ type }: { type: string | null }) {
  const n = type?.toLowerCase();
  if (n === "mobile") return <Smartphone className="size-[15px] text-[#64748B]" />;
  if (n === "tablet") return <Tablet className="size-[15px] text-[#64748B]" />;
  if (n === "desktop") return <Monitor className="size-[15px] text-[#64748B]" />;
  return <HelpCircle className="size-[15px] text-[#94A3B8]" />;
}

/* ── Breakdown table row ── */
function BdRow({ label, icon, visits, conversions }: { label: string; icon?: React.ReactNode; visits: number; conversions: number }) {
  return (
    <div className="grid grid-cols-[1fr_72px_80px] items-center gap-2 border-t border-[#F1F5F9] px-1 py-3.5 first:border-t-0 hover:bg-[#FAFAFA] transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <span className="truncate text-[13px] font-medium text-[#0F172A]">{label}</span>
      </div>
      <span className="text-right text-[13px] font-semibold text-[#0F172A]">{visits.toLocaleString("en-IN")}</span>
      <span className="text-right text-[13px] text-[#64748B]">{conversions.toLocaleString("en-IN")}</span>
    </div>
  );
}

function BdHeader() {
  return (
    <div className="grid grid-cols-[1fr_72px_80px] items-center gap-2 border-b border-[#E2E8F0] pb-2 px-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">Name</span>
      <span className="text-right text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">Visits</span>
      <span className="text-right text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">Conv.</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ pageId?: string }>;
}) {
  const adminUser = await requireAdminUser();
  const { pageId } = await searchParams;

  let selectorPages: Awaited<
    ReturnType<typeof listLandingPagesForAnalyticsSelector>
  > = [];

  let selectedPage = null;
  let detail: LandingPageAnalyticsDetail | null = null;
  let overview: AnalyticsOverview | null = null;

  try {
    selectorPages = await listLandingPagesForAnalyticsSelector();
  } catch (err) {
    console.error("Failed to load analytics page selector", err);
  }

  if (pageId) {
    try {
      selectedPage = await getLandingPageById(pageId);
      if (selectedPage) {
        detail = await getLandingPageAnalyticsDetail(pageId);
      }
    } catch (err) {
      console.error("Failed to load page-specific analytics", err);
    }
  }

  if (!detail) {
    try {
      overview = await getAnalyticsOverview();
    } catch (err) {
      console.error("Failed to load analytics overview", err);
    }
  }

  /* ── max count for event progress bars ── */
  const maxEventCount = detail
    ? Math.max(1, ...detail.eventBreakdown.map((e) => e.count))
    : 1;

  return (
    <AdminShell
      title="Analytics"
      description="Select a landing page to inspect visits, conversions, sources, devices, and recent events."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="relative flex flex-col gap-5">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute right-0 top-0 -z-10 size-[400px] rounded-full bg-[#7C3AED]/[0.06] blur-3xl" />

        {/* ── Selector ── */}
        <AnalyticsLandingPageSelector
          landingPages={selectorPages}
          selectedPageId={pageId}
        />

        {/* ═══ SELECTED PAGE VIEW ═══════════════════════════════════════════ */}
        {selectedPage && detail ? (
          <>
            {/* Context card */}
            <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#F5F3FF]">
                    <PanelTop className="size-[22px] text-[#7C3AED]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-[17px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
                        {selectedPage.channel_name || selectedPage.internal_name}
                      </h2>
                      <StatusBadge status={selectedPage.status} />
                    </div>
                    <p className="mt-0.5 text-[13px] text-[#64748B]">
                      Public Code:{" "}
                      <span className="font-mono font-semibold text-[#0F172A]">
                        /p/{selectedPage.public_code}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-[12px] border-[#E2E8F0] px-4 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC]"
                  >
                    <Link href={`/admin/landing-pages/${selectedPage.id}`}>
                      View Configuration
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-10 rounded-[12px] bg-[#0F172A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#334155]"
                  >
                    <a
                      href={`/p/${selectedPage.public_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Open Public Page
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-6 gap-3">
              <MetricCard
                label="Total Visits"
                value={detail.summary.totalVisits.toLocaleString("en-IN")}
                helper="All time"
                icon={Eye}
                iconBg="bg-[#F5F3FF]"
                iconColor="text-[#7C3AED]"
              />
              <MetricCard
                label="Unique Visitors"
                value={detail.summary.uniqueVisitors.toLocaleString("en-IN")}
                helper="Sessions"
                icon={Users}
                iconBg="bg-[#EFF6FF]"
                iconColor="text-[#2563EB]"
              />
              <MetricCard
                label="Conversions"
                value={detail.summary.totalConversions.toLocaleString("en-IN")}
                helper="All time"
                icon={TrendingUp}
                iconBg="bg-[#ECFDF5]"
                iconColor="text-[#16A34A]"
              />
              <MetricCard
                label="Conv. Rate"
                value={`${detail.summary.conversionRate}%`}
                helper="Conversions ÷ visits"
                icon={Percent}
                iconBg="bg-[#FFF7ED]"
                iconColor="text-[#EA580C]"
              />
              <MetricCard
                label="Today Visits"
                value={detail.summary.todayVisits.toLocaleString("en-IN")}
                helper="Today"
                icon={CalendarDays}
                iconBg="bg-[#EFF6FF]"
                iconColor="text-[#2563EB]"
              />
              <MetricCard
                label="Today Conv."
                value={detail.summary.todayConversions.toLocaleString("en-IN")}
                helper="Today"
                icon={CheckCircle}
                iconBg="bg-[#ECFDF5]"
                iconColor="text-[#16A34A]"
              />
            </div>

            {detail.summary.totalVisits > 0 ? (
              <>
                {/* ── Row 1: Source + Device ── */}
                <div className="grid grid-cols-[1.5fr_1fr] gap-4">
                  {/* Source Breakdown */}
                  <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                    <CardHeader
                      icon={Globe}
                      iconBg="bg-[#F5F3FF]"
                      iconColor="text-[#7C3AED]"
                      title="Source Breakdown"
                      subtitle="Top traffic sources by UTM source or referrer."
                    />
                    {detail.sourceBreakdown.length > 0 ? (
                      <div>
                        <BdHeader />
                        {detail.sourceBreakdown.map((s) => (
                          <BdRow
                            key={s.source}
                            label={s.source}
                            visits={s.visits}
                            conversions={s.conversions}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-[13px] text-[#94A3B8]">No source data yet.</p>
                    )}
                  </div>

                  {/* Device Breakdown */}
                  <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                    <CardHeader
                      icon={Monitor}
                      iconBg="bg-[#EFF6FF]"
                      iconColor="text-[#2563EB]"
                      title="Device Breakdown"
                      subtitle="Visits and conversions by device type."
                    />
                    {detail.deviceBreakdown.length > 0 ? (
                      <div>
                        <BdHeader />
                        {detail.deviceBreakdown.map((d) => (
                          <BdRow
                            key={d.device_type}
                            label={d.device_type.charAt(0).toUpperCase() + d.device_type.slice(1)}
                            icon={<DeviceIcon type={d.device_type} />}
                            visits={d.visits}
                            conversions={d.conversions}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-[13px] text-[#94A3B8]">No device data yet.</p>
                    )}
                  </div>
                </div>

                {/* ── Row 2: Event Breakdown + Recent Events ── */}
                <div className="grid grid-cols-[1fr_2.2fr] gap-4">
                  {/* Event Breakdown with progress bars */}
                  <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                    <CardHeader
                      icon={BarChart3}
                      iconBg="bg-[#F5F3FF]"
                      iconColor="text-[#7C3AED]"
                      title="Event Breakdown"
                      subtitle="Page views and key events."
                    />
                    {detail.eventBreakdown.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {detail.eventBreakdown.map((e) => {
                          const isConversion = [
                            "Lead",
                            "Subscribe",
                            "Contact",
                            "CompleteRegistration",
                            "ButtonClick",
                          ].includes(e.event_name);
                          const barColor = isConversion
                            ? "bg-[#16A34A]"
                            : "bg-[#7C3AED]";
                          const pct = Math.round((e.count / maxEventCount) * 100);
                          return (
                            <div key={e.event_name}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[13px] font-semibold text-[#0F172A]">
                                  {e.event_name}
                                </span>
                                <span className="text-[13px] font-bold tabular-nums text-[#0F172A]">
                                  {e.count.toLocaleString("en-IN")}
                                </span>
                              </div>
                              <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-[13px] text-[#94A3B8]">No events recorded yet.</p>
                    )}
                  </div>

                  {/* Recent Events */}
                  <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                    <CardHeader
                      icon={Zap}
                      iconBg="bg-[#EFF6FF]"
                      iconColor="text-[#2563EB]"
                      title="Recent Events"
                      subtitle="Latest tracked events for this landing page."
                    />
                    {detail.recentEvents.length > 0 ? (
                      <div className="overflow-hidden rounded-[14px] border border-[#E2E8F0]">
                        {/* Table header */}
                        <div className="grid grid-cols-[100px_120px_90px_110px_1fr] items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
                          {["Time", "Event", "CAPI", "Device / Browser", "Source"].map((h) => (
                            <span
                              key={h}
                              className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                        {/* Rows */}
                        <div className="divide-y divide-[#F1F5F9]">
                          {detail.recentEvents.map((ev) => (
                            <div
                              key={ev.id}
                              className="grid grid-cols-[100px_120px_90px_110px_1fr] items-center gap-2 px-4 py-3.5 transition-colors hover:bg-[#FAFAFA]"
                            >
                              <span className="text-[12px] whitespace-nowrap text-[#64748B]">
                                {formatEventTime(ev.created_at)}
                              </span>
                              <span className="text-[13px] font-bold text-[#0F172A]">
                                {ev.event_name}
                              </span>
                              <div>
                                <CapiBadge status={ev.capi_delivery_status} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[12px] capitalize text-[#475569]">
                                  {ev.device_type || "unknown"}
                                </span>
                                <span className="text-[11px] text-[#94A3B8]">
                                  {ev.browser || "unknown"}
                                </span>
                              </div>
                              <span className="truncate text-[12px] text-[#64748B]">
                                {ev.utm_source || safeHostname(ev.referrer)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-[13px] text-[#94A3B8]">No events recorded yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* ── Empty: page selected but zero analytics ── */
              <EmptyState
                icon={BarChart3}
                title="No analytics recorded yet"
                description="Open the public page or share its link to start collecting visits and button clicks."
                action={
                  <Button
                    asChild
                    className="h-10 rounded-[12px] bg-[#0F172A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#334155]"
                  >
                    <a
                      href={`/p/${selectedPage.public_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Public Page
                    </a>
                  </Button>
                }
              />
            )}
          </>
        ) : overview ? (
          /* ═══ NO PAGE SELECTED — All Pages Snapshot ══════════════════════ */
          <>
            {/* Snapshot label */}
            <div className="flex items-center gap-2 px-1">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#ECFDF5]">
                <TrendingUp className="size-4 text-[#16A34A]" />
              </div>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#64748B]">
                All Pages Snapshot
              </h3>
            </div>

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

            {/* Prompt to select a page */}
            <EmptyState
              icon={BarChart3}
              title="Select a landing page to view detailed analytics"
              description="Choose a specific public landing page from the selector above to see visits, conversions, source and device breakdowns, and a live event stream."
            />
          </>
        ) : (
          /* ═══ ERROR STATE ══════════════════════════════════════════════════ */
          <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-10 text-center shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#FEF2F2]">
              <BarChart3 className="size-7 text-[#DC2626]" />
            </div>
            <h3 className="text-[16px] font-extrabold text-[#0F172A]">Unable to load analytics</h3>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-[#64748B]">
              {pageId
                ? "The selected landing page could not be found or has no analytics data."
                : "There was a problem loading analytics data. Please refresh the page."}
            </p>
            <Button
              asChild
              className="mt-6 h-10 rounded-[12px] bg-[#0F172A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#334155]"
            >
              <Link href="/admin/analytics">Back to All Analytics</Link>
            </Button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
