import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TrackingPayload } from "@/lib/validations/tracking";
import type {
  LandingPageAnalyticsSummary,
  AnalyticsOverview,
  TopLandingPageAnalytics,
  RecentTrackingEvent,
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
};

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
  } = params;

  const landingPage = await getActivePublicLandingPageByCode(
    payload.publicCode
  );
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
