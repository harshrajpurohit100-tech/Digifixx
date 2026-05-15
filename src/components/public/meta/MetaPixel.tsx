"use client";

import { useEffect, useRef } from "react";
import {
  createBrowserEventId,
  isValidMetaPixelId,
  normalizeMetaEventName,
} from "@/lib/meta-pixel";

type MetaPixelProps = {
  pixelId: string;
  pageViewEventName?: string;
  landingPageCode?: string;
};

export function MetaPixel({
  pixelId,
  pageViewEventName,
  landingPageCode,
}: MetaPixelProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isValidMetaPixelId(pixelId)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Invalid Meta Pixel ID: ${pixelId}`);
      }
      return;
    }

    if (initialized.current) {
      return;
    }

    initialized.current = true;

    if (typeof window !== "undefined" && !window.fbq) {
      // Standard Meta Pixel base code without noscript (since this requires JS anyway)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f: any = window;
      if (!f._fbq) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n: any = (f.fbq = function (...args: any[]) {
          if (n.callMethod) {
            n.callMethod(...args);
          } else {
            n.queue.push(args);
          }
        });
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        const t = document.createElement("script");
        t.async = !0;
        t.src = "https://connect.facebook.net/en_US/fbevents.js";
        const s = document.getElementsByTagName("script")[0];
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s);
        } else {
          document.head.appendChild(t);
        }
      }
    }

    if (window.fbq) {
      window.fbq("init", pixelId);

      const eventId = createBrowserEventId("pv");
      const eventName = normalizeMetaEventName(pageViewEventName, "PageView");

      window.fbq(
        "track",
        eventName,
        {
          content_name: landingPageCode,
          content_category: "telegram_landing_page",
        },
        { eventID: eventId }
      );
      
      // Note: Phase 9 CAPI will use matching event_id for deduplication.
      // We do not store this event_id in the database yet.
    }
  }, [pixelId, pageViewEventName, landingPageCode]);

  return null;
}
