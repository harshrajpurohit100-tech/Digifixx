"use client";

import { useEffect, useRef } from "react";
import { createBrowserEventId } from "@/lib/meta-pixel";
import type { TrackingEventName } from "@/types/digifixx";

type PublicAnalyticsTrackerProps = {
  publicCode: string;
  clickEventName?: TrackingEventName;
};

export function PublicAnalyticsTracker({
  publicCode,
}: PublicAnalyticsTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utm = {
        source: searchParams.get("utm_source"),
        medium: searchParams.get("utm_medium"),
        campaign: searchParams.get("utm_campaign"),
        content: searchParams.get("utm_content"),
        term: searchParams.get("utm_term"),
        adset: searchParams.get("utm_adset"),
        ad: searchParams.get("utm_ad"),
      };

      const payload = {
        publicCode,
        eventName: "PageView",
        eventId: createBrowserEventId(),
        sourceUrl: window.location.href,
        referrer: document.referrer || null,
        utm,
      };

      fetch("/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        keepalive: true,
      }).catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to track PageView", err);
        }
      });
    } catch {
      // Ignore
    }
  }, [publicCode]);

  return null;
}
