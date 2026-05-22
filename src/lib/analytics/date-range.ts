import {
  DIGIFIXX_TIME_ZONE,
  getIstDayKey,
  getStartOfIstDayUtc,
} from "@/lib/date-format";
import type { AnalyticsDatePreset } from "@/types/digifixx";

export type AnalyticsDateRange = {
  preset: AnalyticsDatePreset;
  from?: string;
  to?: string;
  startDate?: Date;
  endDate?: Date;
  label: string;
};

export const analyticsDatePresets: {
  value: AnalyticsDatePreset;
  label: string;
}[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

const validPresets = new Set<AnalyticsDatePreset>(
  analyticsDatePresets.map((preset) => preset.value)
);

const labelMap = new Map(
  analyticsDatePresets.map((preset) => [preset.value, preset.label])
);

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

function isDateInput(value: string | null | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function getIstMonthParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DIGIFIXX_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(value);

  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    year: map.year,
    month: map.month,
  };
}

function getStartOfIstMonthUtc(value: Date) {
  const { year, month } = getIstMonthParts(value);
  return getStartOfIstDayUtc(`${year}-${String(month).padStart(2, "0")}-01`);
}

function getStartOfNextIstMonthUtc(value: Date) {
  const { year, month } = getIstMonthParts(value);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return getStartOfIstDayUtc(
    `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`
  );
}

function getStartOfPreviousIstMonthUtc(value: Date) {
  const { year, month } = getIstMonthParts(value);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return getStartOfIstDayUtc(
    `${previousYear}-${String(previousMonth).padStart(2, "0")}-01`
  );
}

export function resolveAnalyticsDateRange(input: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}): AnalyticsDateRange {
  const preset = validPresets.has(input.preset as AnalyticsDatePreset)
    ? (input.preset as AnalyticsDatePreset)
    : "last7";

  const todayStart = getStartOfIstDayUtc();
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  let from: string | undefined;
  let to: string | undefined;
  let label = labelMap.get(preset) ?? "Last 7 Days";

  if (preset === "today") {
    startDate = todayStart;
    endDate = addDays(todayStart, 1);
  } else if (preset === "yesterday") {
    startDate = addDays(todayStart, -1);
    endDate = todayStart;
  } else if (preset === "last7") {
    startDate = addDays(todayStart, -6);
    endDate = addDays(todayStart, 1);
  } else if (preset === "last30") {
    startDate = addDays(todayStart, -29);
    endDate = addDays(todayStart, 1);
  } else if (preset === "thisMonth") {
    startDate = getStartOfIstMonthUtc(todayStart);
    endDate = getStartOfNextIstMonthUtc(todayStart);
  } else if (preset === "lastMonth") {
    startDate = getStartOfPreviousIstMonthUtc(todayStart);
    endDate = getStartOfIstMonthUtc(todayStart);
  } else {
    from = isDateInput(input.from) ? input.from ?? undefined : undefined;
    to = isDateInput(input.to) ? input.to ?? undefined : undefined;
    startDate = from ? getStartOfIstDayUtc(from) : undefined;
    endDate = to ? addDays(getStartOfIstDayUtc(to), 1) : undefined;
    label = from && to ? `${from} to ${to}` : "Custom Range";
  }

  return {
    preset,
    from,
    to,
    startDate,
    endDate,
    label,
  };
}

export function getDateInputValue(value?: Date) {
  return value ? getIstDayKey(value) : "";
}
