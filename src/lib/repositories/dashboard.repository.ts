import "server-only";

import { getIstDayKey, getLastIstDays } from "@/lib/date-format";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TrackingEventName } from "@/types/digifixx";

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

function calculateConversionRate(visits: number, conversions: number) {
  return visits > 0 ? Math.round((conversions / visits) * 10000) / 100 : 0;
}

function buildLast7Days() {
  return getLastIstDays(7).map((day) => ({
    key: day.key,
    date: day.date,
    visits: 0,
    conversions: 0,
  }));
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = getSupabaseAdminClient();
  const last7DayWindowStart = getLastIstDays(7)[0].startUtc.toISOString();

  const [
    clientsResult,
    activePagesResult,
    visitsResult,
    conversionsResult,
    sevenDayEventsResult,
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
      .eq("event_name", "PageView")
      .eq("traffic_type", "human"),
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .eq("traffic_type", "human")
      .in("event_name", conversionEvents),
    supabase
      .from("tracking_events")
      .select("landing_page_id, event_name, created_at")
      .gte("created_at", last7DayWindowStart)
      .eq("traffic_type", "human")
      .order("created_at", { ascending: true })
      .limit(10000),
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
    const dayKey = getIstDayKey(event.created_at);
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

  const trackingProfiles =
    (trackingProfilesResult.data as
      | { pixel_id: string | null; capi_token_last4: string | null }[]
      | null) ?? [];

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
