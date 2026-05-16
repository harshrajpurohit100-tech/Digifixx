import { createTrackingEventId } from "@/lib/browser-tracking-event";

export function isValidMetaPixelId(pixelId: string): boolean {
  if (!pixelId) return false;
  const trimmed = pixelId.trim();
  return /^\d{5,30}$/.test(trimmed);
}

export function createBrowserEventId(prefix = "evt"): string {
  return createTrackingEventId(prefix);
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
