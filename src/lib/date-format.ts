export const DIGIFIXX_TIME_ZONE = "Asia/Kolkata";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: DIGIFIXX_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: DIGIFIXX_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: DIGIFIXX_TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DIGIFIXX_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayLabelFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: DIGIFIXX_TIME_ZONE,
  month: "short",
  day: "numeric",
});

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function getIstDateParts(value: string | Date) {
  const parts = dayKeyFormatter.formatToParts(toDate(value));
  const partMap = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    year: partMap.year,
    month: partMap.month,
    day: partMap.day,
  };
}

export function formatIstDate(value: string | Date) {
  return dateFormatter.format(toDate(value));
}

export function formatIstTime(value: string | Date) {
  return timeFormatter.format(toDate(value));
}

export function formatIstDateTime(value: string | Date) {
  return shortDateTimeFormatter.format(toDate(value));
}

export function getIstDayKey(value: string | Date) {
  return dayKeyFormatter.format(toDate(value));
}

export function getStartOfIstDayUtc(value: string | Date = new Date()) {
  const { year, month, day } = getIstDateParts(value);
  return new Date(Date.UTC(year, month - 1, day, -5, -30, 0, 0));
}

export function getLastIstDays(count: number) {
  const todayStartUtc = getStartOfIstDayUtc();

  return Array.from({ length: count }, (_, index) => {
    const startUtc = new Date(
      todayStartUtc.getTime() - (count - 1 - index) * 24 * 60 * 60 * 1000
    );

    return {
      key: getIstDayKey(startUtc),
      date: dayLabelFormatter.format(startUtc),
      startUtc,
    };
  });
}
