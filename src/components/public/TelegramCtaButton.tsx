"use client";

import { Send } from "lucide-react";
import type { TrackingEventName } from "@/types/digifixx";
import { createBrowserEventId, normalizeMetaEventName } from "@/lib/meta-pixel";

type TelegramCtaButtonProps = {
  href: string;
  label: string;
  publicCode: string;
  hasValidUrl: boolean;
  tracking?: {
    pixel_id: string;
    default_click_event: TrackingEventName;
  } | null;
};

export function TelegramCtaButton({
  href,
  label,
  publicCode,
  hasValidUrl,
  tracking,
}: TelegramCtaButtonProps) {
  const handleClick = () => {
    // ── Meta Pixel ──────────────────────────────────────────────────────────
    if (tracking && tracking.pixel_id && typeof window !== "undefined" && window.fbq) {
      const metaEventId = createBrowserEventId("clk");
      const eventName = normalizeMetaEventName(tracking.default_click_event, "Lead");

      window.fbq(
        "track",
        eventName,
        {
          content_name: publicCode,
          content_category: "telegram_landing_page",
          destination: "telegram",
        },
        { eventID: metaEventId }
      );
      // Note: Phase 9 CAPI will use matching event_id for deduplication.
    }

    // ── Internal Digifixx Tracking ───────────────────────────────────────────
    try {
      const clickEventName = normalizeMetaEventName(
        tracking?.default_click_event,
        "Lead"
      );
      const searchParams = new URLSearchParams(window.location.search);
      const internalPayload = {
        publicCode,
        eventName: clickEventName,
        eventId: createBrowserEventId("ctaclk"),
        sourceUrl: window.location.href,
        referrer: document.referrer || null,
        utm: {
          source: searchParams.get("utm_source"),
          medium: searchParams.get("utm_medium"),
          campaign: searchParams.get("utm_campaign"),
          content: searchParams.get("utm_content"),
          term: searchParams.get("utm_term"),
          adset: searchParams.get("utm_adset"),
          ad: searchParams.get("utm_ad"),
        },
        metadata: {
          destination: "telegram",
        },
      };

      fetch("/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(internalPayload),
        credentials: "same-origin",
        keepalive: true,
      }).catch(() => {
        // Silently fail — do not block CTA navigation
      });
    } catch {
      // Silently fail
    }
  };

  if (!hasValidUrl) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-[50px] w-full max-w-[340px] cursor-not-allowed items-center justify-center rounded-[14px] bg-[#94A3B8] px-[22px] text-[15px] font-extrabold text-white"
      >
        Telegram link unavailable
      </button>
    );
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-[50px] w-full max-w-[340px] items-center justify-center gap-2 rounded-[14px] bg-[#0284C7] px-[22px] text-[15px] font-extrabold text-white shadow-[0_10px_20px_rgba(2,132,199,0.22)] transition-colors hover:bg-[#0369A1] active:bg-[#075985] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0284C7]"
    >
      <Send className="size-[17px]" aria-hidden="true" />
      {label}
    </a>
  );
}
