import "server-only";

import { format, startOfDay, subDays } from "date-fns";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CapiDeliveryStatus, TrackingEventName } from "@/types/digifixx";

const conversionEvents: TrackingEventName[] = [
  "Lead",
  "Contact",
  "Subscribe",
  "CompleteRegistration",
  "ButtonClick",
];

export type DashboardOverview = {
  totalClients: number;
  activeLandingPages: number;
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  visitsLast7Days: {
    date: string;
    visits: number;
    conversions: number;
  }[];
  topLandingPages: {
    id: string;
    public_code: string;
    channel_name: string | null;
    internal_name: string;
    client_name: string | null;
    visits: number;
    conversions: number;
    conversionRate: number;
  }[];
  recentEvents: {
    id: string;
    event_name: TrackingEventName;
    created_at: string;
    public_code: string | null;
    channel_name: string | null;
    capi_delivery_status: CapiDeliveryStatus | null;
  }[];
  trackingHealth: {
    internalTracking: "active";
    metaPixel: "active" | "needs_setup";
    metaCapi: "active" | "needs_setup";
    publicPages: "active" | "inactive";
  };
};

type TrackingEventRow = {
  landing_page_id: string;
  event_name: TrackingEventName;
  created_at: string;
};

type LandingPageRow = {
  id: string;
  public_code: string;
  internal_name: string;
  channel_name: string | null;
  clients: { name: string } | { name: string }[] | null;
};

type RecentEventRow = {
  id: string;
  event_name: TrackingEventName;
  created_at: string;
  capi_delivery_status: CapiDeliveryStatus | null;
  landing_pages: {
    public_code: string | null;
    channel_name: string | null;
  } | {
    public_code: string | null;
    channel_name: string | null;
  }[] | null;
};

function calculateConversionRate(visits: number, conversions: number) {
  return visits > 0 ? Math.round((conversions / visits) * 10000) / 100 : 0;
}

function buildLast7Days() {
  const today = startOfDay(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const day = subDays(today, 6 - index);
    return {
      key: format(day, "yyyy-MM-dd"),
      date: format(day, "MMM d"),
      visits: 0,
      conversions: 0,
    };
  });
}

function getClientName(client: LandingPageRow["clients"]) {
  if (Array.isArray(client)) {
    return client[0]?.name ?? null;
  }

  return client?.name ?? null;
}

function getRecentEventPage(page: RecentEventRow["landing_pages"]) {
  if (Array.isArray(page)) {
    return page[0] ?? null;
  }

  return page;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = getSupabaseAdminClient();

  const [
    clientsResult,
    activePagesResult,
    visitsResult,
    conversionsResult,
    recentEventsResult,
    sevenDayEventsResult,
    landingPagesResult,
    allEventsResult,
    trackingProfilesResult,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("landing_pages")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .eq("event_name", "PageView"),
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .in("event_name", conversionEvents),
    supabase
      .from("tracking_events")
      .select(
        `
        id,
        event_name,
        created_at,
        capi_delivery_status,
        landing_pages (
          public_code,
          channel_name
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("tracking_events")
      .select("landing_page_id, event_name, created_at")
      .gte("created_at", subDays(startOfDay(new Date()), 6).toISOString())
      .order("created_at", { ascending: true })
      .limit(10000),
    supabase
      .from("landing_pages")
      .select(
        `
        id,
        public_code,
        internal_name,
        channel_name,
        clients (
          name
        )
      `
      )
      .in("status", ["active", "paused"]),
    supabase
      .from("tracking_events")
      .select("landing_page_id, event_name")
      .limit(20000),
    supabase
      .from("meta_tracking_profiles")
      .select("pixel_id, capi_token_last4")
      .eq("is_active", true)
      .limit(500),
  ]);

  const totalVisits = visitsResult.count ?? 0;
  const totalConversions = conversionsResult.count ?? 0;

  const last7Days = buildLast7Days();
  const last7DayMap = new Map(last7Days.map((day) => [day.key, day]));

  ((sevenDayEventsResult.data ?? []) as TrackingEventRow[]).forEach((event) => {
    const dayKey = format(new Date(event.created_at), "yyyy-MM-dd");
    const day = last7DayMap.get(dayKey);

    if (!day) {
      return;
    }

    if (event.event_name === "PageView") {
      day.visits += 1;
    } else if (conversionEvents.includes(event.event_name)) {
      day.conversions += 1;
    }
  });

  const eventTotalsByLandingPage = new Map<
    string,
    { visits: number; conversions: number }
  >();

  ((allEventsResult.data ?? []) as TrackingEventRow[]).forEach((event) => {
    const totals = eventTotalsByLandingPage.get(event.landing_page_id) ?? {
      visits: 0,
      conversions: 0,
    };

    if (event.event_name === "PageView") {
      totals.visits += 1;
    } else if (conversionEvents.includes(event.event_name)) {
      totals.conversions += 1;
    }

    eventTotalsByLandingPage.set(event.landing_page_id, totals);
  });

  const topLandingPages = ((landingPagesResult.data ?? []) as unknown as LandingPageRow[])
    .map((page) => {
      const totals = eventTotalsByLandingPage.get(page.id) ?? {
        visits: 0,
        conversions: 0,
      };

      return {
        id: page.id,
        public_code: page.public_code,
        channel_name: page.channel_name,
        internal_name: page.internal_name,
        client_name: getClientName(page.clients),
        visits: totals.visits,
        conversions: totals.conversions,
        conversionRate: calculateConversionRate(
          totals.visits,
          totals.conversions
        ),
      };
    })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  const trackingProfiles =
    (trackingProfilesResult.data as
      | { pixel_id: string | null; capi_token_last4: string | null }[]
      | null) ?? [];

  const recentEvents = ((recentEventsResult.data ?? []) as unknown as RecentEventRow[]).map(
    (event) => {
      const page = getRecentEventPage(event.landing_pages);

      return {
      id: event.id,
      event_name: event.event_name,
      created_at: event.created_at,
      public_code: page?.public_code ?? null,
      channel_name: page?.channel_name ?? null,
      capi_delivery_status: event.capi_delivery_status,
      };
    }
  );

  return {
    totalClients: clientsResult.count ?? 0,
    activeLandingPages: activePagesResult.count ?? 0,
    totalVisits,
    totalConversions,
    conversionRate: calculateConversionRate(totalVisits, totalConversions),
    visitsLast7Days: last7Days.map(({ date, visits, conversions }) => ({
      date,
      visits,
      conversions,
    })),
    topLandingPages,
    recentEvents,
    trackingHealth: {
      internalTracking: "active",
      metaPixel: trackingProfiles.some((profile) => profile.pixel_id)
        ? "active"
        : "needs_setup",
      metaCapi: trackingProfiles.some((profile) => profile.capi_token_last4)
        ? "active"
        : "needs_setup",
      publicPages: (activePagesResult.count ?? 0) > 0 ? "active" : "inactive",
    },
  };
}
