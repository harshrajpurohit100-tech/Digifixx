import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Copy,
  Download,
  Eye,
  ExternalLink,
  Globe,
  HelpCircle,
  Monitor,
  MousePointerClick,
  PanelTop,
  Percent,
  ShieldCheck,
  Search,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { AnalyticsDateRangeControls } from "@/components/admin/AnalyticsDateRangeControls";
import { AdminShell } from "@/components/admin/AdminShell";
import { CopyButton } from "@/components/admin/CopyButton";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AnalyticsLandingPageSelector } from "@/components/admin/AnalyticsLandingPageSelector";
import { Button } from "@/components/ui/button";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import {
  parseAnalyticsSearchParams,
  setAnalyticsParam,
  toUrlSearchParams,
} from "@/lib/analytics/filter-params";
import { getSourceOpenUrl } from "@/lib/analytics/source-links";
import { formatIstDateTime } from "@/lib/date-format";
import {
  getAnalyticsEventExplorer,
  getAnalyticsOverview,
  getLandingPageAnalyticsDetail,
  listLandingPagesForAnalyticsSelector,
} from "@/lib/repositories/tracking.repository";
import { getLandingPageById } from "@/lib/repositories/landing-pages.repository";
import type {
  AnalyticsOverview,
  AnalyticsEventExplorer,
  CapiDeliveryStatus,
  LandingPageAnalyticsDetail,
  TrafficQuality,
  TrafficType,
} from "@/types/digifixx";

export const dynamic = "force-dynamic";

/* ── helpers ── */
function formatEventTime(createdAt: string) {
  try {
    return formatIstDateTime(createdAt);
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

function TrafficBadge({ type }: { type: TrafficType }) {
  const styles: Record<TrafficType, { bg: string; text: string; dot: string; label: string }> = {
    human: {
      bg: "bg-[#ECFDF5]",
      text: "text-[#166534]",
      dot: "bg-[#10B981]",
      label: "Human",
    },
    bot: {
      bg: "bg-[#FEF2F2]",
      text: "text-[#B91C1C]",
      dot: "bg-[#EF4444]",
      label: "Bot",
    },
    system: {
      bg: "bg-[#EFF6FF]",
      text: "text-[#1D4ED8]",
      dot: "bg-[#2563EB]",
      label: "System",
    },
    unknown: {
      bg: "bg-[#F1F5F9]",
      text: "text-[#475569]",
      dot: "bg-[#94A3B8]",
      label: "Unknown",
    },
  };
  const s = styles[type];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function TrafficQualityCard({ quality }: { quality: TrafficQuality }) {
  const items = [
    {
      label: "Human Visits",
      value: quality.humanVisits,
      badge: "Human",
      badgeClass: "bg-[#ECFDF5] text-[#166534]",
    },
    {
      label: "Bot Views",
      value: quality.botVisits,
      badge: "Bot",
      badgeClass: "bg-[#FEF2F2] text-[#B91C1C]",
    },
    {
      label: "System Views",
      value: quality.systemVisits,
      badge: "System",
      badgeClass: "bg-[#EFF6FF] text-[#1D4ED8]",
    },
    {
      label: "Unknown",
      value: quality.unknownVisits,
      badge: "Unknown",
      badgeClass: "bg-[#F1F5F9] text-[#475569]",
    },
    {
      label: "Raw Total",
      value: quality.rawVisits,
      badge: "All",
      badgeClass: "bg-white text-[#64748B] border border-[#E2E8F0]",
    },
  ];

  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
      <CardHeader
        icon={ShieldCheck}
        iconBg="bg-[#EFF6FF]"
        iconColor="text-[#2563EB]"
        title="Traffic Quality"
        subtitle="Bot and platform preview traffic is separated from human analytics."
      />
      <div className="grid grid-cols-5 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">
                {item.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeClass}`}>
                {item.badge}
              </span>
            </div>
            <p className="mt-3 text-[22px] font-extrabold tracking-[-0.03em] text-[#0F172A]">
              {item.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
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
function BdRow({
  label,
  icon,
  visits,
  conversions,
  openUrl,
  showOpen = false,
}: {
  label: string;
  icon?: React.ReactNode;
  visits: number;
  conversions: number;
  openUrl?: string | null;
  showOpen?: boolean;
}) {
  return (
    <div className={`grid ${showOpen ? "grid-cols-[1fr_72px_80px_92px]" : "grid-cols-[1fr_72px_80px]"} items-center gap-2 border-t border-[#F1F5F9] px-1 py-3.5 transition-colors first:border-t-0 hover:bg-[#FAFAFA]`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <span className="truncate text-[13px] font-medium text-[#0F172A]">{label}</span>
      </div>
      <span className="text-right text-[13px] font-semibold text-[#0F172A]">{visits.toLocaleString("en-IN")}</span>
      <span className="text-right text-[13px] text-[#64748B]">{conversions.toLocaleString("en-IN")}</span>
      {showOpen && (
        <div className="flex justify-end">
          {openUrl ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-[#E2E8F0] bg-white px-2.5 text-[11px] font-bold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              Open
              <ExternalLink className="size-3" />
            </a>
          ) : (
            <span className="text-[12px] text-[#CBD5E1]">—</span>
          )}
        </div>
      )}
    </div>
  );
}

function BdHeader({ showOpen = false }: { showOpen?: boolean }) {
  return (
    <div className={`grid ${showOpen ? "grid-cols-[1fr_72px_80px_92px]" : "grid-cols-[1fr_72px_80px]"} items-center gap-2 border-b border-[#E2E8F0] px-1 pb-2`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">Name</span>
      <span className="text-right text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">Visits</span>
      <span className="text-right text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">Conv.</span>
      {showOpen && (
        <span className="text-right text-[11px] font-bold uppercase tracking-[0.05em] text-[#94A3B8]">Open</span>
      )}
    </div>
  );
}

function shortEventId(value: string) {
  return value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}

function getEventSourceLabel(event: {
  utm_source: string | null;
  referrer: string | null;
}) {
  return event.utm_source || safeHostname(event.referrer);
}

function buildAnalyticsHref(
  currentParams: URLSearchParams,
  updates: Record<string, string | number | null | undefined>
) {
  const nextParams = new URLSearchParams(currentParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    setAnalyticsParam(nextParams, key, value);
  });

  const query = nextParams.toString();
  return query ? `/admin/analytics?${query}` : "/admin/analytics";
}

function buildExportHref(currentParams: URLSearchParams) {
  const exportParams = new URLSearchParams(currentParams.toString());
  exportParams.delete("eventsPage");
  return `/api/admin/analytics/export?${exportParams.toString()}`;
}

function EventFilterBar({
  currentParams,
  filters,
  pageId,
}: {
  currentParams: URLSearchParams;
  filters: ReturnType<typeof parseAnalyticsSearchParams>;
  pageId: string;
}) {
  return (
    <form
      action="/admin/analytics"
      className="mb-4 grid grid-cols-[1.4fr_150px_140px_140px_110px_auto] items-end gap-2"
    >
      <input type="hidden" name="pageId" value={pageId} />
      <input type="hidden" name="preset" value={filters.dateRange.preset} />
      {filters.dateRange.from && (
        <input type="hidden" name="from" value={filters.dateRange.from} />
      )}
      {filters.dateRange.to && (
        <input type="hidden" name="to" value={filters.dateRange.to} />
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          Search
        </span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            name="q"
            defaultValue={filters.search}
            placeholder="Search event id, source, page..."
            className="h-10 w-full rounded-[12px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[13px] font-medium text-[#0F172A] outline-none transition-colors focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          Event Type
        </span>
        <select
          name="eventType"
          defaultValue={filters.eventType}
          className="h-10 rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
        >
          <option value="all">All</option>
          <option value="PageView">PageView</option>
          <option value="Lead">Lead</option>
          <option value="Purchase">Purchase</option>
          <option value="CompleteRegistration">CompleteRegistration</option>
          <option value="custom">Custom Events</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          Traffic
        </span>
        <select
          name="trafficType"
          defaultValue={filters.trafficType}
          className="h-10 rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
        >
          <option value="all">All</option>
          <option value="human">Human</option>
          <option value="bot">Bot</option>
          <option value="system">System</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          CAPI
        </span>
        <select
          name="capiStatus"
          defaultValue={filters.capiStatus}
          className="h-10 rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
        >
          <option value="all">All</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
          <option value="pending">Pending</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          Rows
        </span>
        <select
          name="pageSize"
          defaultValue={filters.pageSize}
          className="h-10 rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]/50"
        >
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </label>

      <button
        type="submit"
        className="h-10 rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#334155]"
      >
        Apply
      </button>

      <input type="hidden" name="eventsPage" value="1" />

      {(filters.search ||
        filters.eventType !== "all" ||
        filters.trafficType !== "all" ||
        filters.capiStatus !== "all") && (
        <Link
          href={buildAnalyticsHref(currentParams, {
            q: null,
            eventType: null,
            trafficType: null,
            capiStatus: null,
            eventsPage: 1,
          })}
          className="col-span-full text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
        >
          Clear Filters
        </Link>
      )}
    </form>
  );
}

function EventExplorerCard({
  explorer,
  filters,
  currentParams,
  pageId,
}: {
  explorer: AnalyticsEventExplorer;
  filters: ReturnType<typeof parseAnalyticsSearchParams>;
  currentParams: URLSearchParams;
  pageId: string;
}) {
  const { pagination } = explorer;
  const previousHref = buildAnalyticsHref(currentParams, {
    eventsPage: Math.max(1, pagination.page - 1),
  });
  const nextHref = buildAnalyticsHref(currentParams, {
    eventsPage: Math.min(pagination.totalPages, pagination.page + 1),
  });

  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <CardHeader
          icon={Zap}
          iconBg="bg-[#EFF6FF]"
          iconColor="text-[#2563EB]"
          title="Event Explorer"
          subtitle="Paginated tracked events for the current filters."
        />
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-[12px] border-[#E2E8F0] px-4 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC]"
        >
          <a href={buildExportHref(currentParams)}>
            <Download className="mr-2 size-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <EventFilterBar
        currentParams={currentParams}
        filters={filters}
        pageId={pageId}
      />

      {explorer.events.length > 0 ? (
        <div className="overflow-hidden rounded-[14px] border border-[#E2E8F0]">
          <div className="grid grid-cols-[112px_118px_92px_92px_1fr_150px_150px] items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
            {["Time", "Event", "Traffic", "CAPI", "Source", "Landing Page", "Event ID"].map((h) => (
              <span
                key={h}
                className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]"
              >
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {explorer.events.map((event) => {
              const source = getEventSourceLabel(event);

              return (
                <div
                  key={event.id}
                  className="grid grid-cols-[112px_118px_92px_92px_1fr_150px_150px] items-center gap-2 px-4 py-3.5 transition-colors hover:bg-[#FAFAFA]"
                >
                  <span className="whitespace-nowrap text-[12px] text-[#64748B]">
                    {formatEventTime(event.created_at)}
                  </span>
                  <span className="text-[13px] font-bold text-[#0F172A]">
                    {event.event_name}
                  </span>
                  <div>
                    <TrafficBadge type={event.traffic_type} />
                  </div>
                  <div>
                    <CapiBadge status={event.capi_delivery_status} />
                  </div>
                  <span className="truncate text-[12px] text-[#64748B]">
                    {source}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-[#0F172A]">
                      {event.landing_page_name || "Unknown page"}
                    </p>
                    <p className="truncate font-mono text-[11px] text-[#94A3B8]">
                      {event.landing_page_public_code
                        ? `/p/${event.landing_page_public_code}`
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-mono text-[11px] text-[#475569]">
                      {shortEventId(event.event_id)}
                    </span>
                    <CopyButton
                      value={event.event_id}
                      ariaLabel="Copy event ID"
                      className="size-7 rounded-[8px] px-0"
                    >
                      <Copy className="size-3.5" />
                    </CopyButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Zap}
          title="No events found"
          description="No events match current filters."
          action={
            <Button asChild variant="outline" className="h-10 rounded-[12px]">
              <Link
                href={buildAnalyticsHref(currentParams, {
                  q: null,
                  eventType: null,
                  trafficType: null,
                  capiStatus: null,
                  eventsPage: 1,
                })}
              >
                Clear Filters
              </Link>
            </Button>
          }
        />
      )}

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#E2E8F0] pt-4">
        <p className="text-[12px] font-medium text-[#64748B]">
          Showing {pagination.from.toLocaleString("en-IN")}–
          {pagination.to.toLocaleString("en-IN")} of{" "}
          {pagination.total.toLocaleString("en-IN")} events
        </p>
        <div className="flex items-center gap-2">
          <Button
            asChild={pagination.page > 1}
            variant="outline"
            className="h-9 rounded-[10px] border-[#E2E8F0] px-3 text-xs font-semibold"
            disabled={pagination.page <= 1}
          >
            {pagination.page > 1 ? (
              <Link href={previousHref}>
                <ArrowLeft className="mr-1.5 size-3.5" />
                Previous
              </Link>
            ) : (
              <span>
                <ArrowLeft className="mr-1.5 inline size-3.5" />
                Previous
              </span>
            )}
          </Button>
          <span className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#0F172A]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            asChild={pagination.page < pagination.totalPages}
            variant="outline"
            className="h-9 rounded-[10px] border-[#E2E8F0] px-3 text-xs font-semibold"
            disabled={pagination.page >= pagination.totalPages}
          >
            {pagination.page < pagination.totalPages ? (
              <Link href={nextHref}>
                Next
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            ) : (
              <span>
                Next
                <ArrowRight className="ml-1.5 inline size-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const adminUser = await requireAdminUser();
  const rawSearchParams = await searchParams;
  const currentParams = toUrlSearchParams(rawSearchParams);
  const analyticsFilters = parseAnalyticsSearchParams(rawSearchParams);
  const { pageId, dateRange } = analyticsFilters;

  let selectorPages: Awaited<
    ReturnType<typeof listLandingPagesForAnalyticsSelector>
  > = [];

  let selectedPage = null;
  let detail: LandingPageAnalyticsDetail | null = null;
  let eventExplorer: AnalyticsEventExplorer | null = null;
  let eventExplorerError = false;
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
        detail = await getLandingPageAnalyticsDetail(pageId, {
          dateRange,
        });
        eventExplorer = await getAnalyticsEventExplorer({
          landingPageId: pageId,
          dateRange,
          search: analyticsFilters.search,
          eventType: analyticsFilters.eventType,
          trafficType: analyticsFilters.trafficType,
          capiStatus: analyticsFilters.capiStatus,
          page: analyticsFilters.eventsPage,
          pageSize: analyticsFilters.pageSize,
        });
      }
    } catch (err) {
      console.error("Failed to load page-specific analytics", err);
      eventExplorerError = true;
    }
  }

  if (!detail) {
    try {
      overview = await getAnalyticsOverview({
        dateRange,
      });
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

        <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[15px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
                Reporting Window
              </p>
              <p className="mt-0.5 text-[12px] text-[#64748B]">
                Metrics are currently scoped to {dateRange.label}.
              </p>
            </div>
            <AnalyticsDateRangeControls
              preset={dateRange.preset}
              from={dateRange.from}
              to={dateRange.to}
              hiddenFields={{
                pageId,
                q: analyticsFilters.search,
                eventType: analyticsFilters.eventType,
                trafficType: analyticsFilters.trafficType,
                capiStatus: analyticsFilters.capiStatus,
                pageSize: analyticsFilters.pageSize,
              }}
            />
          </div>
        </div>

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
                    <p className="mt-1 text-[12px] text-[#64748B]">
                      Analytics are filtered to human traffic. Bot and system traffic is shown separately below.
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
                helper="Human PageViews"
                icon={Eye}
                iconBg="bg-[#F5F3FF]"
                iconColor="text-[#7C3AED]"
              />
              <MetricCard
                label="Unique Visitors"
                value={detail.summary.uniqueVisitors.toLocaleString("en-IN")}
                helper="Human sessions"
                icon={Users}
                iconBg="bg-[#EFF6FF]"
                iconColor="text-[#2563EB]"
              />
              <MetricCard
                label="Conversions"
                value={detail.summary.totalConversions.toLocaleString("en-IN")}
                helper="Human events"
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
                helper="Human today"
                icon={CalendarDays}
                iconBg="bg-[#EFF6FF]"
                iconColor="text-[#2563EB]"
              />
              <MetricCard
                label="Today Conv."
                value={detail.summary.todayConversions.toLocaleString("en-IN")}
                helper="Human today"
                icon={CheckCircle}
                iconBg="bg-[#ECFDF5]"
                iconColor="text-[#16A34A]"
              />
            </div>

            <TrafficQualityCard quality={detail.trafficQuality} />

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
                      subtitle="Human traffic sources by UTM source or referrer."
                    />
                    {detail.sourceBreakdown.length > 0 ? (
                      <div>
                        <BdHeader showOpen />
                        {detail.sourceBreakdown.map((s) => (
                          <BdRow
                            key={s.source}
                            label={s.source}
                            visits={s.visits}
                            conversions={s.conversions}
                            openUrl={getSourceOpenUrl(s.source)}
                            showOpen
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
                      subtitle="Human visits and conversions by device type."
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

                {/* ── Row 2: Event Breakdown ── */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Event Breakdown with progress bars */}
                  <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                    <CardHeader
                      icon={BarChart3}
                      iconBg="bg-[#F5F3FF]"
                      iconColor="text-[#7C3AED]"
                      title="Event Breakdown"
                      subtitle="Human page views and key events."
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
                </div>

              </>
            ) : (
              /* ── Empty: page selected but zero analytics ── */
              <EmptyState
                icon={BarChart3}
                title="No analytics recorded yet"
                description="Human visits and button clicks will appear here. Bot and system traffic is shown in the Traffic Quality card."
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

            {eventExplorer ? (
              <EventExplorerCard
                explorer={eventExplorer}
                filters={analyticsFilters}
                currentParams={currentParams}
                pageId={pageId ?? selectedPage.id}
              />
            ) : eventExplorerError ? (
              <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                <h3 className="text-[16px] font-extrabold text-[#0F172A]">
                  Unable to load analytics events
                </h3>
                <p className="mt-2 text-[13px] text-[#64748B]">
                  Try adjusting filters or refreshing the page.
                </p>
              </div>
            ) : null}
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
                helper="Human PageView events across all pages"
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
                helper="Human Lead, Contact, Subscribe, etc."
                icon={MousePointerClick}
                tone="success"
              />
              <StatCard
                title="Conversion Rate"
                value={`${overview.conversionRate}%`}
                helper="Human conversions ÷ visits"
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
