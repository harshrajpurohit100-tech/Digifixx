"use client";

import { useEffect, useRef } from "react";

import { createTrackingEventId } from "@/lib/browser-tracking-event";
import { isValidMetaPixelId, normalizeMetaEventName } from "@/lib/meta-pixel";
import type { TrackingEventName } from "@/types/digifixx";

type PublicPageTrackingBridgeProps = {
  publicCode: string;
  tracking?: {
    pixel_id: string;
    default_pageview_event: TrackingEventName;
    default_click_event: TrackingEventName;
  } | null;
};

function ensureMetaPixel(pixelId: string) {
  if (!isValidMetaPixelId(pixelId)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Invalid Meta Pixel ID: ${pixelId}`);
    }
    return false;
  }

  if (typeof window !== "undefined" && !window.fbq) {
    // Standard Meta Pixel base code without noscript because this component needs JS.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaWindow: any = window;
    if (!metaWindow._fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fbq: any = (metaWindow.fbq = function (...args: any[]) {
        if (fbq.callMethod) {
          fbq.callMethod(...args);
        } else {
          fbq.queue.push(args);
        }
      });

      metaWindow._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";

      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }
  }

  window.fbq?.("init", pixelId);
  return Boolean(window.fbq);
}

function getTrackingUtmParams() {
  const searchParams = new URLSearchParams(window.location.search);

  return {
    source: searchParams.get("utm_source"),
    medium: searchParams.get("utm_medium"),
    campaign: searchParams.get("utm_campaign"),
    content: searchParams.get("utm_content"),
    term: searchParams.get("utm_term"),
    adset: searchParams.get("utm_adset"),
    ad: searchParams.get("utm_ad"),
  };
}

export function PublicPageTrackingBridge({
  publicCode,
  tracking,
}: PublicPageTrackingBridgeProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) {
      return;
    }

    tracked.current = true;

    try {
      const pageViewEventId = createTrackingEventId("pv");
      const pageViewEventName = normalizeMetaEventName(
        tracking?.default_pageview_event,
        "PageView"
      );

      if (tracking?.pixel_id && ensureMetaPixel(tracking.pixel_id)) {
        window.fbq?.(
          "track",
          pageViewEventName,
          {
            content_name: publicCode,
            content_category: "telegram_landing_page",
          },
          { eventID: pageViewEventId }
        );
      }

      fetch("/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicCode,
          eventName: pageViewEventName,
          eventId: pageViewEventId,
          sourceUrl: window.location.href,
          referrer: document.referrer || null,
          utm: getTrackingUtmParams(),
        }),
        credentials: "same-origin",
        keepalive: true,
      }).catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to track PageView", error);
        }
      });
    } catch {
      // Public tracking should never interrupt page rendering.
    }
  }, [publicCode, tracking]);

  return null;
}
