import { resolveAnalyticsDateRange } from "@/lib/analytics/date-range";
import type {
  AnalyticsDatePreset,
  AnalyticsEventFilter,
  CapiDeliveryStatus,
  TrafficType,
} from "@/types/digifixx";

type RawSearchParams = Record<string, string | string[] | undefined>;

const eventFilters = new Set<AnalyticsEventFilter>([
  "all",
  "PageView",
  "Lead",
  "Purchase",
  "CompleteRegistration",
  "custom",
]);

const trafficFilters = new Set<TrafficType | "all">([
  "all",
  "human",
  "bot",
  "system",
  "unknown",
]);

const capiFilters = new Set<CapiDeliveryStatus | "all">([
  "all",
  "sent",
  "failed",
  "skipped",
  "pending",
]);

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function toUrlSearchParams(searchParams: RawSearchParams) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  });

  return params;
}

export function parseAnalyticsSearchParams(searchParams: RawSearchParams) {
  const preset = firstValue(searchParams.preset);
  const from = firstValue(searchParams.from);
  const to = firstValue(searchParams.to);
  const eventType = firstValue(searchParams.eventType);
  const trafficType = firstValue(searchParams.trafficType);
  const capiStatus = firstValue(searchParams.capiStatus);

  return {
    pageId: firstValue(searchParams.pageId) ?? null,
    dateRange: resolveAnalyticsDateRange({
      preset,
      from,
      to,
    }),
    preset: preset as AnalyticsDatePreset | undefined,
    from,
    to,
    search: firstValue(searchParams.q)?.trim() ?? "",
    eventType: eventFilters.has(eventType as AnalyticsEventFilter)
      ? (eventType as AnalyticsEventFilter)
      : "all",
    trafficType: trafficFilters.has(trafficType as TrafficType | "all")
      ? (trafficType as TrafficType | "all")
      : "all",
    capiStatus: capiFilters.has(capiStatus as CapiDeliveryStatus | "all")
      ? (capiStatus as CapiDeliveryStatus | "all")
      : "all",
    eventsPage: safePositiveInt(firstValue(searchParams.eventsPage), 1),
    pageSize: safePositiveInt(firstValue(searchParams.pageSize), 50),
  };
}

export function setAnalyticsParam(
  params: URLSearchParams,
  key: string,
  value: string | number | null | undefined
) {
  if (value === null || value === undefined || value === "") {
    params.delete(key);
  } else {
    params.set(key, String(value));
  }
}
