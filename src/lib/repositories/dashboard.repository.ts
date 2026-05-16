import "server-only";

import { format, startOfDay, subDays } from "date-fns";

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

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = getSupabaseAdminClient();

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
      .eq("event_name", "PageView"),
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .in("event_name", conversionEvents),
    supabase
      .from("tracking_events")
      .select("landing_page_id, event_name, created_at")
      .gte("created_at", subDays(startOfDay(new Date()), 6).toISOString())
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
