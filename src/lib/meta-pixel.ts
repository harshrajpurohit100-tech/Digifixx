export function isValidMetaPixelId(pixelId: string): boolean {
  if (!pixelId) return false;
  const trimmed = pixelId.trim();
  return /^\d{5,30}$/.test(trimmed);
}

export function createBrowserEventId(prefix = "evt"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  
  // Fallback if crypto.randomUUID is not available
  const randomStr = Math.random().toString(36).substring(2, 15);
  const timeStr = Date.now().toString(36);
  return `${prefix}_${timeStr}_${randomStr}`;
}

export type MetaBrowserEventName =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "Contact"
  | "Subscribe"
  | "CompleteRegistration"
  | "ButtonClick";

const allowedEvents: Set<string> = new Set([
  "PageView",
  "ViewContent",
  "Lead",
  "Contact",
  "Subscribe",
  "CompleteRegistration",
  "ButtonClick",
]);

export function normalizeMetaEventName(
  eventName?: string | null,
  fallback: MetaBrowserEventName = "Lead"
): MetaBrowserEventName {
  if (!eventName) {
    return fallback;
  }
  
  if (allowedEvents.has(eventName)) {
    return eventName as MetaBrowserEventName;
  }
  
  return fallback;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}
