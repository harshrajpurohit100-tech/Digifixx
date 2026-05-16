import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TrackingPayload } from "@/lib/validations/tracking";
import type {
  LandingPageAnalyticsSummary,
  AnalyticsOverview,
  TopLandingPageAnalytics,
  RecentTrackingEvent,
  AnalyticsLandingPageSelectorItem,
  DetailedRecentTrackingEvent,
  LandingPageAnalyticsDetail,
  LandingPageStatus,
  CapiDeliveryStatus,
  PublicLandingPage,
} from "@/types/digifixx";
import { getActivePublicLandingPageByCode } from "./public-landing-pages.repository";

type TrackEventParams = {
  payload: TrackingPayload;
  visitorId: string;
  sessionId: string;
  ipHash: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  landingPage?: Pick<PublicLandingPage, "id" | "client_id" | "public_code">;
  metaPixelId?: string | null;
  capiDeliveryStatus?: CapiDeliveryStatus;
  capiResponse?: unknown;
  capiError?: string | null;
  capiSentAt?: string | null;
};

export async function getTrackingEventByLandingPageAndEventId(
  landingPageId: string,
  eventId: string
) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tracking_events")
    .select("id, capi_delivery_status")
    .eq("landing_page_id", landingPageId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as { id: string; capi_delivery_status: CapiDeliveryStatus } | null;
}

export async function trackPublicEvent(params: TrackEventParams) {
  const {
    payload,
    visitorId,
    sessionId,
    ipHash,
    userAgent,
    browser,
    os,
    deviceType,
    landingPage: providedLandingPage,
    metaPixelId,
    capiDeliveryStatus = "not_sent",
    capiResponse,
    capiError,
    capiSentAt,
  } = params;

  const landingPage =
    providedLandingPage ??
    (await getActivePublicLandingPageByCode(payload.publicCode));
  if (!landingPage) {
    throw new Error("Landing page not found or inactive.");
  }

  const supabase = getSupabaseAdminClient();

  let visitorSessionId: string | null = null;

  const { data: existingSession } = await supabase
    .from("visitor_sessions")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existingSession) {
    visitorSessionId = existingSession.id;
    await supabase
      .from("visitor_sessions")
      .update({
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", visitorSessionId);
  } else {
    const { data: newSession } = await supabase
      .from("visitor_sessions")
      .insert({
        landing_page_id: landingPage.id,
        visitor_id: visitorId,
        session_id: sessionId,
        ip_hash: ipHash,
        user_agent: userAgent,
        browser: browser,
        os: os,
        device_type: deviceType,
        referrer: payload.referrer,
        first_utm_source: payload.utm?.source,
        first_utm_medium: payload.utm?.medium,
        first_utm_campaign: payload.utm?.campaign,
        first_utm_content: payload.utm?.content,
        first_utm_term: payload.utm?.term,
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (newSession) {
      visitorSessionId = newSession.id;
    }
  }

  const { error: insertError } = await supabase.from("tracking_events").insert({
    client_id: landingPage.client_id,
    landing_page_id: landingPage.id,
    visitor_session_id: visitorSessionId,
    event_name: payload.eventName,
    event_id: payload.eventId,
    event_source_url: payload.sourceUrl,
    action_source: "website",
    utm_source: payload.utm?.source,
    utm_medium: payload.utm?.medium,
    utm_campaign: payload.utm?.campaign,
    utm_content: payload.utm?.content,
    utm_term: payload.utm?.term,
    utm_adset: payload.utm?.adset,
    utm_ad: payload.utm?.ad,
    referrer: payload.referrer,
    ip_hash: ipHash,
    user_agent: userAgent,
    browser: browser,
    os: os,
    device_type: deviceType,
    meta_pixel_id: metaPixelId,
    capi_delivery_status: capiDeliveryStatus,
    capi_response: capiResponse ?? null,
    capi_error: capiError ?? null,
    capi_sent_at: capiSentAt ?? null,
    metadata: payload.metadata || {},
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { duplicate: true };
    }
    throw insertError;
  }

  return { duplicate: false };
}

export async function getLandingPageAnalyticsSummary(
  landingPageId: string
): Promise<LandingPageAnalyticsSummary> {
  const supabase = getSupabaseAdminClient();

  const { count: totalVisits } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .eq("event_name", "PageView");

  const { count: totalConversions } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .in("event_name", [
      "Lead",
      "Contact",
      "Subscribe",
      "CompleteRegistration",
      "ButtonClick",
    ]);

  const { count: uniqueVisitors } = await supabase
    .from("visitor_sessions")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayVisits } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .eq("event_name", "PageView")
    .gte("created_at", today.toISOString());

  const { count: todayConversions } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .in("event_name", [
      "Lead",
      "Contact",
      "Subscribe",
      "CompleteRegistration",
      "ButtonClick",
    ])
    .gte("created_at", today.toISOString());

  const visits = totalVisits ?? 0;
  const conversions = totalConversions ?? 0;
  const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

  return {
    totalVisits: visits,
    totalConversions: conversions,
    uniqueVisitors: uniqueVisitors ?? 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
    todayVisits: todayVisits ?? 0,
    todayConversions: todayConversions ?? 0,
  };
}

export async function getLandingPagesAnalyticsMap(
  landingPageIds: string[]
): Promise<Record<string, LandingPageAnalyticsSummary>> {
  if (landingPageIds.length === 0) return {};

  const supabase = getSupabaseAdminClient();
  const map: Record<string, LandingPageAnalyticsSummary> = {};

  for (const id of landingPageIds) {
    map[id] = {
      totalVisits: 0,
      totalConversions: 0,
      uniqueVisitors: 0,
      conversionRate: 0,
      todayVisits: 0,
      todayConversions: 0,
    };
  }

  const { data: events } = await supabase
    .from("tracking_events")
    .select("landing_page_id, event_name")
    .in("landing_page_id", landingPageIds);

  if (events) {
    for (const ev of events) {
      if (ev.event_name === "PageView") {
        map[ev.landing_page_id].totalVisits += 1;
      } else if (
        [
          "Lead",
          "Contact",
          "Subscribe",
          "CompleteRegistration",
          "ButtonClick",
        ].includes(ev.event_name)
      ) {
        map[ev.landing_page_id].totalConversions += 1;
      }
    }
  }

  for (const id of landingPageIds) {
    const visits = map[id].totalVisits;
    const conversions = map[id].totalConversions;
    map[id].conversionRate =
      visits > 0 ? Math.round((conversions / visits) * 10000) / 100 : 0;
  }

  return map;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const supabase = getSupabaseAdminClient();

  const { count: totalVisits } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("event_name", "PageView");

  const { count: totalConversions } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .in("event_name", [
      "Lead",
      "Contact",
      "Subscribe",
      "CompleteRegistration",
      "ButtonClick",
    ]);

  const { count: uniqueVisitors } = await supabase
    .from("visitor_sessions")
    .select("*", { count: "exact", head: true });

  const visits = totalVisits ?? 0;
  const conversions = totalConversions ?? 0;
  const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

  // Recent Events
  const { data: recentEventsData } = await supabase
    .from("tracking_events")
    .select(`
      id,
      event_name,
      device_type,
      utm_source,
      created_at,
      capi_delivery_status,
      landing_pages (
        public_code,
        internal_name,
        channel_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentEvents: RecentTrackingEvent[] = ((recentEventsData || []) as any[]).map((ev) => ({
    id: ev.id as string,
    event_name: ev.event_name as string,
    public_code: (ev.landing_pages?.public_code || "Unknown") as string,
    internal_name: (ev.landing_pages?.internal_name || "Unknown") as string,
    channel_name: (ev.landing_pages?.channel_name || null) as string | null,
    device_type: ev.device_type as string | null,
    utm_source: ev.utm_source as string | null,
    created_at: ev.created_at as string,
    capi_delivery_status: ev.capi_delivery_status as CapiDeliveryStatus,
  }));

  // Top landing pages - since we don't have a view, we'll fetch all active pages and compute their basic stats.
  // In a large system, this should be an RPC. For now, it's fine.
  const { data: activePages } = await supabase
    .from("landing_pages")
    .select("id, public_code, internal_name, channel_name")
    .in("status", ["active", "paused"]);

  let topLandingPages: TopLandingPageAnalytics[] = [];

  if (activePages && activePages.length > 0) {
    const ids = activePages.map(p => p.id);
    const analyticsMap = await getLandingPagesAnalyticsMap(ids);
    
    const pagesWithStats = activePages.map(p => {
      const stats = analyticsMap[p.id];
      return {
        id: p.id,
        public_code: p.public_code,
        internal_name: p.internal_name,
        channel_name: p.channel_name,
        visits: stats?.totalVisits || 0,
        conversions: stats?.totalConversions || 0,
        conversionRate: stats?.conversionRate || 0,
      };
    });

    topLandingPages = pagesWithStats
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  }

  return {
    totalVisits: visits,
    totalConversions: conversions,
    uniqueVisitors: uniqueVisitors ?? 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
    topLandingPages,
    recentEvents,
  };
}

export async function getLandingPageAnalyticsDetail(
  landingPageId: string
): Promise<LandingPageAnalyticsDetail> {
  const summary = await getLandingPageAnalyticsSummary(landingPageId);
  const supabase = getSupabaseAdminClient();

  // Fetch latest events for breakdowns (capped at 5000)
  const { data: events } = await supabase
    .from("tracking_events")
    .select("event_name, utm_source, referrer, device_type, browser, created_at, id, capi_delivery_status")
    .eq("landing_page_id", landingPageId)
    .order("created_at", { ascending: false })
    .limit(5000);

  const sourceMap: Record<string, { visits: number; conversions: number }> = {};
  const deviceMap: Record<string, { visits: number; conversions: number }> = {};
  const eventMap: Record<string, number> = {};
  const recentEvents: DetailedRecentTrackingEvent[] = [];

  const conversionEvents = [
    "Lead",
    "Contact",
    "Subscribe",
    "CompleteRegistration",
    "ButtonClick",
  ];

  if (events) {
    for (const ev of events) {
      // Event breakdown
      eventMap[ev.event_name] = (eventMap[ev.event_name] || 0) + 1;

      // Source breakdown
      let source = ev.utm_source || "Direct / Unknown";
      if (source === "Direct / Unknown" && ev.referrer) {
        try {
          const url = new URL(ev.referrer);
          source = url.hostname;
        } catch {
          // ignore invalid referrer
        }
      }
      if (!sourceMap[source]) sourceMap[source] = { visits: 0, conversions: 0 };
      if (ev.event_name === "PageView") sourceMap[source].visits++;
      if (conversionEvents.includes(ev.event_name))
        sourceMap[source].conversions++;

      // Device breakdown
      const device = ev.device_type || "unknown";
      if (!deviceMap[device]) deviceMap[device] = { visits: 0, conversions: 0 };
      if (ev.event_name === "PageView") deviceMap[device].visits++;
      if (conversionEvents.includes(ev.event_name))
        deviceMap[device].conversions++;

      // Recent events (first 20)
      if (recentEvents.length < 20) {
        recentEvents.push({
          id: ev.id,
          event_name: ev.event_name,
          device_type: ev.device_type,
          browser: ev.browser,
          utm_source: ev.utm_source,
          referrer: ev.referrer,
          created_at: ev.created_at,
          capi_delivery_status: ev.capi_delivery_status,
        });
      }
    }
  }

  return {
    summary,
    recentEvents,
    sourceBreakdown: Object.entries(sourceMap)
      .map(([source, stats]) => ({
        source,
        ...stats,
      }))
      .sort((a, b) => b.visits - a.visits),
    deviceBreakdown: Object.entries(deviceMap)
      .map(([device_type, stats]) => ({
        device_type,
        ...stats,
      }))
      .sort((a, b) => b.visits - a.visits),
    eventBreakdown: Object.entries(eventMap)
      .map(([event_name, count]) => ({
        event_name,
        count,
      }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function listLandingPagesForAnalyticsSelector(): Promise<
  AnalyticsLandingPageSelectorItem[]
> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("landing_pages")
    .select("id, public_code, channel_name, internal_name, status, updated_at")
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false });

  const statusOrder = { active: 0, paused: 1, draft: 2, archived: 3 };

  return (data || [])
    .sort((a, b) => {
      const orderA = statusOrder[a.status as keyof typeof statusOrder] ?? 99;
      const orderB = statusOrder[b.status as keyof typeof statusOrder] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    })
    .map((item) => ({
      id: item.id,
      public_code: item.public_code,
      channel_name: item.channel_name,
      internal_name: item.internal_name,
      status: item.status as LandingPageStatus,
    }));
}
