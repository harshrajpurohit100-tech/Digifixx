import { BarChart3, MousePointerClick, TrendingUp, Users, ExternalLink, Globe, Layout, Monitor, Smartphone, Tablet } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

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
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AnalyticsLandingPageSelector } from "@/components/admin/AnalyticsLandingPageSelector";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import { 
  getAnalyticsOverview, 
  getLandingPageAnalyticsDetail, 
  listLandingPagesForAnalyticsSelector 
} from "@/lib/repositories/tracking.repository";
import { getLandingPageById } from "@/lib/repositories/landing-pages.repository";
import type { AnalyticsOverview, LandingPageAnalyticsDetail } from "@/types/digifixx";

export const dynamic = "force-dynamic";

function formatEventTime(createdAt: string) {
  try {
    return format(new Date(createdAt), "MMM d, HH:mm");
  } catch {
    return createdAt;
  }
}



function DeviceIcon({ type }: { type: string | null }) {
  const normalized = type?.toLowerCase();
  if (normalized === "mobile") return <Smartphone className="size-4 text-[#64748B]" />;
  if (normalized === "tablet") return <Tablet className="size-4 text-[#64748B]" />;
  if (normalized === "desktop") return <Monitor className="size-4 text-[#64748B]" />;
  return <Globe className="size-4 text-[#64748B]" />;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ pageId?: string }>;
}) {
  const adminUser = await requireAdminUser();
  const { pageId } = await searchParams;

  const selectorPages = await listLandingPagesForAnalyticsSelector();
  
  let selectedPage = null;
  let detail: LandingPageAnalyticsDetail | null = null;
  let overview: AnalyticsOverview | null = null;

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

  return (
    <AdminShell
      title="Analytics"
      description="Select a landing page to inspect visits, conversions, sources, devices, and recent events."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <AnalyticsLandingPageSelector 
          landingPages={selectorPages} 
          selectedPageId={pageId} 
        />

        {selectedPage && detail ? (
          <>
            {/* Selected Page Context */}
            <AdminCard padding="md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <Layout className="size-6 text-[#475569]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#0F172A]">
                        {selectedPage.channel_name || selectedPage.internal_name}
                      </h2>
                      <StatusBadge status={selectedPage.status} />
                    </div>
                    <p className="text-sm text-[#64748B]">
                      Public Code: <span className="font-mono font-medium text-[#0F172A]">{selectedPage.public_code}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="h-9 rounded-[10px] border-[#E2E8F0]">
                    <Link href={`/admin/landing-pages/${selectedPage.id}`}>
                      View Configuration
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="h-9 rounded-[10px] bg-[#0F172A] text-white hover:bg-[#334155]">
                    <a href={`/p/${selectedPage.public_code}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 size-4" />
                      Open Public Page
                    </a>
                  </Button>
                </div>
              </div>
            </AdminCard>

            {/* Detail Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Total Visits</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[#0F172A]">{detail.summary.totalVisits.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Unique Visitors</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[#0F172A]">{detail.summary.uniqueVisitors.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Conversions</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[#0F172A]">{detail.summary.totalConversions.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Conv. Rate</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[#0F172A]">{detail.summary.conversionRate}%</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Today Visits</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[#0F172A]">{detail.summary.todayVisits.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Today Conv.</p>
                <p className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[#0F172A]">{detail.summary.todayConversions.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {detail.summary.totalVisits > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
                  {/* Source Breakdown */}
                  <AdminCard>
                    <SectionHeader title="Source Breakdown" description="Top traffic sources by UTM source or Referrer." />
                    <div className="mt-5 overflow-hidden rounded-xl border border-[#E2E8F0]">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                            <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Source</TableHead>
                            <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Visits</TableHead>
                            <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Conversions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detail.sourceBreakdown.map((s) => (
                            <TableRow key={s.source} className="border-[#E2E8F0] hover:bg-[#F8FAFC]">
                              <TableCell className="px-4 py-3 text-sm font-medium text-[#0F172A]">{s.source}</TableCell>
                              <TableCell className="px-4 py-3 text-sm text-[#475569]">{s.visits.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="px-4 py-3 text-sm text-[#475569]">{s.conversions.toLocaleString("en-IN")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AdminCard>

                  {/* Device Breakdown */}
                  <AdminCard>
                    <SectionHeader title="Device Breakdown" />
                    <div className="mt-5 overflow-hidden rounded-xl border border-[#E2E8F0]">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                            <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Device</TableHead>
                            <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Visits</TableHead>
                            <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Conv.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detail.deviceBreakdown.map((d) => (
                            <TableRow key={d.device_type} className="border-[#E2E8F0] hover:bg-[#F8FAFC]">
                              <TableCell className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <DeviceIcon type={d.device_type} />
                                  <span className="text-sm font-medium capitalize text-[#0F172A]">{d.device_type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-[#475569]">{d.visits.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="px-4 py-3 text-sm text-[#475569]">{d.conversions.toLocaleString("en-IN")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AdminCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
                  {/* Event Breakdown */}
                  <AdminCard>
                    <SectionHeader title="Event Breakdown" />
                    <div className="mt-5 divide-y divide-[#E2E8F0]">
                      {detail.eventBreakdown.map((e) => (
                        <div key={e.event_name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <span className="text-sm font-medium text-[#475569]">{e.event_name}</span>
                          <span className="text-sm font-bold text-[#0F172A]">{e.count.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </AdminCard>

                  {/* Recent Events */}
                  <AdminCard>
                    <SectionHeader title="Recent Events" />
                    <div className="mt-5 overflow-hidden rounded-xl border border-[#E2E8F0]">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                              <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Time</TableHead>
                              <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Event</TableHead>
                              <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Device / Browser</TableHead>
                              <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">Source</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detail.recentEvents.map((ev) => (
                              <TableRow key={ev.id} className="border-[#E2E8F0] hover:bg-[#F8FAFC]">
                                <TableCell className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                                  {formatEventTime(ev.created_at)}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                                  {ev.event_name}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs capitalize text-[#475569]">{ev.device_type || "unknown"}</span>
                                    <span className="text-[11px] text-[#94A3B8]">{ev.browser || "unknown"}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-xs text-[#64748B]">
                                  {ev.utm_source || (ev.referrer ? new URL(ev.referrer).hostname : "Direct")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </AdminCard>
                </div>
              </>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No analytics recorded yet"
                description="Open the public page or share its link to start collecting visits and button clicks."
                action={
                  <Button asChild className="mt-4 rounded-[10px] bg-[#0F172A] text-white hover:bg-[#334155]">
                    <a href={`/p/${selectedPage.public_code}`} target="_blank" rel="noopener noreferrer">
                      Open Public Page
                    </a>
                  </Button>
                }
              />
            )}
          </>
        ) : overview ? (
          <>
            {/* All Pages Snapshot */}
            <div className="flex items-center gap-2 px-1">
              <TrendingUp className="size-4 text-[#16A34A]" />
              <h3 className="text-sm font-bold text-[#0F172A]">All Pages Snapshot</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            <EmptyState
              icon={Layout}
              title="Select a landing page to view analytics"
              description="Choose a public landing page from the selector above to see detailed visits, conversions, sources, and devices."
            />
          </>
        ) : (
          <AdminCard padding="lg">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#FEF2F2] mb-4">
                <BarChart3 className="size-8 text-[#DC2626]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Unable to load analytics</h3>
              <p className="mt-2 text-sm text-[#64748B] max-w-sm">
                {pageId ? "The selected landing page could not be found or has no analytics data." : "There was a problem loading analytics data. Please refresh the page or try again later."}
              </p>
              <Button asChild className="mt-6 h-10 rounded-[10px] bg-[#0F172A] px-6 text-sm font-semibold text-white hover:bg-[#334155]">
                <Link href="/admin/analytics">
                  Back to All Analytics
                </Link>
              </Button>
            </div>
          </AdminCard>
        )}
      </div>
    </AdminShell>
  );
}
