import "server-only";

import type { AnalyticsDateRange } from "@/lib/analytics/date-range";
import { getStartOfIstDayUtc } from "@/lib/date-format";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TrackingPayload } from "@/lib/validations/tracking";
import type {
  AnalyticsEventExplorer,
  AnalyticsEventFilter,
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
  TrafficQuality,
  TrafficType,
} from "@/types/digifixx";
import { getActivePublicLandingPageByCode } from "./public-landing-pages.repository";

const conversionEvents = [
  "Lead",
  "Contact",
  "Subscribe",
  "CompleteRegistration",
  "ButtonClick",
];

const eventExplorerPageSizes = [50, 100, 200] as const;

type AnalyticsFilters = {
  dateRange?: Pick<AnalyticsDateRange, "startDate" | "endDate">;
};

type AnalyticsEventExplorerFilters = AnalyticsFilters & {
  landingPageId?: string | null;
  search?: string | null;
  eventType?: AnalyticsEventFilter | null;
  trafficType?: TrafficType | "all" | null;
  capiStatus?: CapiDeliveryStatus | "all" | null;
  page?: number | null;
  pageSize?: number | null;
};

type RawExplorerEvent = {
  id: string;
  event_name: string;
  event_id: string;
  device_type: string | null;
  browser: string | null;
  utm_source: string | null;
  referrer: string | null;
  created_at: string;
  capi_delivery_status: CapiDeliveryStatus;
  traffic_type: TrafficType | null;
  bot_reason: string | null;
  landing_page_id: string;
  visitor_sessions:
    | {
        visitor_id: string | null;
        session_id: string | null;
      }
    | {
        visitor_id: string | null;
        session_id: string | null;
      }[]
    | null;
  landing_pages:
    | {
        public_code: string | null;
        internal_name: string | null;
        channel_name: string | null;
      }
    | {
        public_code: string | null;
        internal_name: string | null;
        channel_name: string | null;
      }[]
    | null;
};

// Supabase query builders carry very deep generic types; keep this small helper
// structurally typed at the boundary so filtered queries remain readable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyDateRangeToQuery(query: any, dateRange?: AnalyticsFilters["dateRange"]) {
  let nextQuery = query;

  if (dateRange?.startDate) {
    nextQuery = nextQuery.gte("created_at", dateRange.startDate.toISOString());
  }

  if (dateRange?.endDate) {
    nextQuery = nextQuery.lt("created_at", dateRange.endDate.toISOString());
  }

  return nextQuery;
}

function normalizePageSize(value?: number | null): 50 | 100 | 200 {
  return eventExplorerPageSizes.includes(value as 50 | 100 | 200)
    ? (value as 50 | 100 | 200)
    : 50;
}

function normalizePage(value?: number | null) {
  return value && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 1;
}

function sanitizeSearchTerm(value?: string | null) {
  return value?.trim().replace(/[%,()]/g, "").slice(0, 120) || null;
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mapExplorerEvent(row: RawExplorerEvent): DetailedRecentTrackingEvent {
  const visitorSession = firstRelation(row.visitor_sessions);
  const landingPage = firstRelation(row.landing_pages);

  return {
    id: row.id,
    event_name: row.event_name,
    event_id: row.event_id,
    device_type: row.device_type,
    browser: row.browser,
    utm_source: row.utm_source,
    referrer: row.referrer,
    created_at: row.created_at,
    capi_delivery_status: row.capi_delivery_status,
    traffic_type: row.traffic_type ?? "unknown",
    bot_reason: row.bot_reason,
    landing_page_id: row.landing_page_id,
    landing_page_public_code: landingPage?.public_code ?? null,
    landing_page_name:
      landingPage?.channel_name ?? landingPage?.internal_name ?? null,
    visitor_id: visitorSession?.visitor_id ?? null,
    session_id: visitorSession?.session_id ?? null,
  };
}

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
  trafficType?: TrafficType;
  isBot?: boolean;
  botReason?: string | null;
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
    trafficType = "unknown",
    isBot = false,
    botReason = null,
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
    .eq("landing_page_id", landingPage.id)
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
    traffic_type: trafficType,
    is_bot: isBot,
    bot_reason: botReason,
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
  landingPageId: string,
  filters: AnalyticsFilters = {}
): Promise<LandingPageAnalyticsSummary> {
  const supabase = getSupabaseAdminClient();

  const totalVisitsQuery = supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .eq("event_name", "PageView")
    .eq("traffic_type", "human");

  const { count: totalVisits } = await applyDateRangeToQuery(
    totalVisitsQuery,
    filters.dateRange
  );

  const totalConversionsQuery = supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .eq("traffic_type", "human")
    .in("event_name", conversionEvents);

  const { count: totalConversions } = await applyDateRangeToQuery(
    totalConversionsQuery,
    filters.dateRange
  );

  const humanVisitorSessionsQuery = supabase
    .from("tracking_events")
    .select("visitor_session_id")
    .eq("landing_page_id", landingPageId)
    .eq("event_name", "PageView")
    .eq("traffic_type", "human")
    .not("visitor_session_id", "is", null)
    .limit(10000);

  const { data: humanVisitorSessions } = await applyDateRangeToQuery(
    humanVisitorSessionsQuery,
    filters.dateRange
  );

  const todayStart = getStartOfIstDayUtc();

  const { count: todayVisits } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .eq("event_name", "PageView")
    .eq("traffic_type", "human")
    .gte("created_at", todayStart.toISOString());

  const { count: todayConversions } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId)
    .eq("traffic_type", "human")
    .in("event_name", conversionEvents)
    .gte("created_at", todayStart.toISOString());

  const visits = totalVisits ?? 0;
  const conversions = totalConversions ?? 0;
  const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

  return {
    totalVisits: visits,
    totalConversions: conversions,
    uniqueVisitors: new Set(
      ((humanVisitorSessions ?? []) as { visitor_session_id: string | null }[]).map(
        (event) => event.visitor_session_id
      )
    ).size,
    conversionRate: Math.round(conversionRate * 100) / 100,
    todayVisits: todayVisits ?? 0,
    todayConversions: todayConversions ?? 0,
  };
}

export async function getLandingPagesAnalyticsMap(
  landingPageIds: string[],
  filters: AnalyticsFilters = {}
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

  const eventsQuery = supabase
    .from("tracking_events")
    .select("landing_page_id, event_name")
    .in("landing_page_id", landingPageIds)
    .eq("traffic_type", "human");

  const { data: events } = await applyDateRangeToQuery(
    eventsQuery,
    filters.dateRange
  );

  if (events) {
    for (const ev of events) {
      if (ev.event_name === "PageView") {
        map[ev.landing_page_id].totalVisits += 1;
      } else if (
        conversionEvents.includes(ev.event_name)
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

export async function getAnalyticsOverview(
  filters: AnalyticsFilters = {}
): Promise<AnalyticsOverview> {
  const supabase = getSupabaseAdminClient();

  const totalVisitsQuery = supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("event_name", "PageView")
    .eq("traffic_type", "human");

  const { count: totalVisits } = await applyDateRangeToQuery(
    totalVisitsQuery,
    filters.dateRange
  );

  const totalConversionsQuery = supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("traffic_type", "human")
    .in("event_name", conversionEvents);

  const { count: totalConversions } = await applyDateRangeToQuery(
    totalConversionsQuery,
    filters.dateRange
  );

  const uniqueVisitorsQuery = supabase
    .from("tracking_events")
    .select("visitor_session_id")
    .eq("event_name", "PageView")
    .eq("traffic_type", "human")
    .not("visitor_session_id", "is", null)
    .limit(10000);

  const { data: humanVisitorSessions } = await applyDateRangeToQuery(
    uniqueVisitorsQuery,
    filters.dateRange
  );

  const visits = totalVisits ?? 0;
  const conversions = totalConversions ?? 0;
  const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

  // Recent Events
  const recentEventsQuery = supabase
    .from("tracking_events")
    .select(`
      id,
      event_name,
      device_type,
      utm_source,
      created_at,
      capi_delivery_status,
      traffic_type,
      landing_pages (
        public_code,
        internal_name,
        channel_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: recentEventsData } = await applyDateRangeToQuery(
    recentEventsQuery,
    filters.dateRange
  );

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
    traffic_type: (ev.traffic_type || "unknown") as TrafficType,
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
    const analyticsMap = await getLandingPagesAnalyticsMap(ids, filters);
    
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
    uniqueVisitors: new Set(
      ((humanVisitorSessions ?? []) as { visitor_session_id: string | null }[]).map(
        (event) => event.visitor_session_id
      )
    ).size,
    conversionRate: Math.round(conversionRate * 100) / 100,
    topLandingPages,
    recentEvents,
  };
}

export async function getLandingPageAnalyticsDetail(
  landingPageId: string,
  filters: AnalyticsFilters = {}
): Promise<LandingPageAnalyticsDetail> {
  const summary = await getLandingPageAnalyticsSummary(landingPageId, filters);
  const supabase = getSupabaseAdminClient();

  // Fetch latest events for breakdowns (capped at 5000)
  const eventsQuery = supabase
    .from("tracking_events")
    .select("event_name, utm_source, referrer, device_type, browser, created_at, id, capi_delivery_status, traffic_type, bot_reason")
    .eq("landing_page_id", landingPageId)
    .order("created_at", { ascending: false })
    .limit(5000);

  const { data: events } = await applyDateRangeToQuery(
    eventsQuery,
    filters.dateRange
  );

  const sourceMap: Record<string, { visits: number; conversions: number }> = {};
  const deviceMap: Record<string, { visits: number; conversions: number }> = {};
  const eventMap: Record<string, number> = {};
  const trafficQuality: TrafficQuality = {
    humanVisits: 0,
    botVisits: 0,
    systemVisits: 0,
    unknownVisits: 0,
    rawVisits: 0,
    humanConversions: 0,
    botConversions: 0,
    systemConversions: 0,
    unknownConversions: 0,
  };

  if (events) {
    for (const ev of events) {
      const trafficType = (ev.traffic_type || "unknown") as TrafficType;
      const isConversion = conversionEvents.includes(ev.event_name);

      if (ev.event_name === "PageView") {
        trafficQuality.rawVisits += 1;
        if (trafficType === "human") trafficQuality.humanVisits += 1;
        if (trafficType === "bot") trafficQuality.botVisits += 1;
        if (trafficType === "system") trafficQuality.systemVisits += 1;
        if (trafficType === "unknown") trafficQuality.unknownVisits += 1;
      }

      if (isConversion) {
        if (trafficType === "human") trafficQuality.humanConversions += 1;
        if (trafficType === "bot") trafficQuality.botConversions += 1;
        if (trafficType === "system") trafficQuality.systemConversions += 1;
        if (trafficType === "unknown") trafficQuality.unknownConversions += 1;
      }

      if (trafficType === "human") {
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
        if (isConversion) sourceMap[source].conversions++;

        // Device breakdown
        const device = ev.device_type || "unknown";
        if (!deviceMap[device]) deviceMap[device] = { visits: 0, conversions: 0 };
        if (ev.event_name === "PageView") deviceMap[device].visits++;
        if (isConversion) deviceMap[device].conversions++;
      }

    }
  }

  return {
    summary,
    trafficQuality,
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

async function findLandingPageIdsForEventSearch(search: string) {
  const supabase = getSupabaseAdminClient();
  const term = `%${search}%`;
  const { data } = await supabase
    .from("landing_pages")
    .select("id")
    .or(
      `public_code.ilike.${term},internal_name.ilike.${term},channel_name.ilike.${term}`
    )
    .limit(50);

  return (data ?? []).map((page) => page.id as string);
}

function applyEventTypeFilter<
  T extends {
    eq: (column: string, value: string) => T;
  },
>(query: T, eventType?: AnalyticsEventFilter | null) {
  if (!eventType || eventType === "all") {
    return query;
  }

  if (eventType === "custom") {
    return query.eq("event_name", "Custom");
  }

  if (eventType === "Purchase") {
    return query.eq("custom_event_name", "Purchase");
  }

  return query.eq("event_name", eventType);
}

async function getEventSearchOrFilter(search?: string | null) {
  const sanitized = sanitizeSearchTerm(search);

  if (!sanitized) {
    return null;
  }

  const landingPageIds = await findLandingPageIdsForEventSearch(sanitized);
  const term = `%${sanitized}%`;
  const filters = [
    `event_id.ilike.${term}`,
    `event_name.ilike.${term}`,
    `custom_event_name.ilike.${term}`,
    `utm_source.ilike.${term}`,
    `referrer.ilike.${term}`,
    `event_source_url.ilike.${term}`,
  ];

  if (landingPageIds.length > 0) {
    filters.push(`landing_page_id.in.(${landingPageIds.join(",")})`);
  }

  return filters.join(",");
}

function applyExplorerBaseFilters<
  T extends {
    eq: (column: string, value: string) => T;
    gte: (column: string, value: string) => T;
    lt: (column: string, value: string) => T;
    or: (filters: string) => T;
  },
>(
  query: T,
  filters: AnalyticsEventExplorerFilters,
  searchOrFilter: string | null
) {
  let nextQuery = applyDateRangeToQuery(query, filters.dateRange);

  if (filters.landingPageId) {
    nextQuery = nextQuery.eq("landing_page_id", filters.landingPageId);
  }

  nextQuery = applyEventTypeFilter(nextQuery, filters.eventType);

  if (filters.trafficType && filters.trafficType !== "all") {
    nextQuery = nextQuery.eq("traffic_type", filters.trafficType);
  }

  if (filters.capiStatus && filters.capiStatus !== "all") {
    nextQuery = nextQuery.eq("capi_delivery_status", filters.capiStatus);
  }

  if (searchOrFilter) {
    nextQuery = nextQuery.or(searchOrFilter);
  }

  return nextQuery;
}

export async function getAnalyticsEventExplorer(
  filters: AnalyticsEventExplorerFilters
): Promise<AnalyticsEventExplorer> {
  const supabase = getSupabaseAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const page = normalizePage(filters.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const searchOrFilter = await getEventSearchOrFilter(filters.search);

  const query = supabase
    .from("tracking_events")
    .select(
      `
      id,
      event_name,
      event_id,
      device_type,
      browser,
      utm_source,
      referrer,
      created_at,
      capi_delivery_status,
      traffic_type,
      bot_reason,
      landing_page_id,
      visitor_sessions (
        visitor_id,
        session_id
      ),
      landing_pages (
        public_code,
        internal_name,
        channel_name
      )
    `,
      { count: "exact" }
    );

  const { data, count, error } = await applyExplorerBaseFilters(
    query,
    filters,
    searchOrFilter
  )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const total = count ?? 0;

  return {
    events: ((data ?? []) as RawExplorerEvent[]).map(mapExplorerEvent),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      from: total === 0 ? 0 : from + 1,
      to: Math.min(from + pageSize, total),
    },
  };
}

export async function listAnalyticsEventsForExport(
  filters: Omit<AnalyticsEventExplorerFilters, "page" | "pageSize"> & {
    offset: number;
    limit: number;
  }
) {
  const supabase = getSupabaseAdminClient();
  const searchOrFilter = await getEventSearchOrFilter(filters.search);

  const query = supabase
    .from("tracking_events")
    .select(
      `
      id,
      event_name,
      event_id,
      device_type,
      browser,
      utm_source,
      referrer,
      created_at,
      capi_delivery_status,
      traffic_type,
      bot_reason,
      landing_page_id,
      visitor_sessions (
        visitor_id,
        session_id
      ),
      landing_pages (
        public_code,
        internal_name,
        channel_name
      )
    `
    );

  const { data, error } = await applyExplorerBaseFilters(
    query,
    filters,
    searchOrFilter
  )
    .order("created_at", { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1);

  if (error) {
    throw error;
  }

  return ((data ?? []) as RawExplorerEvent[]).map(mapExplorerEvent);
}

export async function listLandingPagesForAnalyticsSelector(): Promise<
  AnalyticsLandingPageSelectorItem[]
> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("id, public_code, channel_name, internal_name, status, updated_at")
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

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
