import { NextRequest, NextResponse } from "next/server";
import { trackingPayloadSchema } from "@/lib/validations/tracking";
import { sendMetaCapiEvent, type MetaCapiSendResult } from "@/lib/meta/capi";
import { getActiveDecryptedTrackingProfileForLandingPage } from "@/lib/repositories/meta-tracking.repository";
import { getActivePublicLandingPageByCode } from "@/lib/repositories/public-landing-pages.repository";
import {
  getTrackingEventByLandingPageAndEventId,
  trackPublicEvent,
} from "@/lib/repositories/tracking.repository";
import { classifyTraffic } from "@/lib/tracking/bot-classifier";
import { getOrCreateTrackingCookies } from "@/lib/tracking/cookies";
import { getRequestIp, hashIp } from "@/lib/tracking/ip";
import { parseUserAgent } from "@/lib/tracking/user-agent";
import { isSafeHttpUrl } from "@/lib/url";
import type { CapiDeliveryStatus } from "@/types/digifixx";

const MAX_TRACKING_BODY_BYTES = 5000;

function getSafeCapiFailure(error: unknown): MetaCapiSendResult {
  const message =
    error instanceof Error && error.message
      ? error.message.slice(0, 300)
      : "Unable to send Meta CAPI event.";

  return {
    status: "failed",
    error: message,
    sentAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    
    // 1. Basic length guard before parsing
    if (bodyText.length > MAX_TRACKING_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Payload too large" },
        { status: 400 }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // 2. Validate payload
    const parsed = trackingPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    if (!isSafeHttpUrl(payload.sourceUrl)) {
      return NextResponse.json(
        { ok: false, error: "Invalid source URL" },
        { status: 400 }
      );
    }

    const landingPage = await getActivePublicLandingPageByCode(
      payload.publicCode
    );

    if (!landingPage) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    const userAgent = req.headers.get("user-agent");
    const trafficClassification = classifyTraffic({
      userAgent,
      acceptLanguage: req.headers.get("accept-language"),
      secFetchMode: req.headers.get("sec-fetch-mode"),
      secFetchDest: req.headers.get("sec-fetch-dest"),
      secFetchSite: req.headers.get("sec-fetch-site"),
    });

    const duplicateEvent = await getTrackingEventByLandingPageAndEventId(
      landingPage.id,
      payload.eventId
    );

    if (duplicateEvent) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        capiStatus: duplicateEvent.capi_delivery_status,
        trafficType: trafficClassification.trafficType,
      });
    }

    // 3. Resolve Cookies
    const { visitorId, sessionId } = await getOrCreateTrackingCookies();

    // 4. Resolve IP and User Agent
    const rawIp = getRequestIp(req);
    const ipHash = hashIp(rawIp);
    const { browser, os, device_type } = parseUserAgent(userAgent);

    let capiResult: MetaCapiSendResult = {
      status: "skipped",
      error: "No active Meta tracking profile configured.",
    };
    let metaPixelId: string | null = null;

    try {
      const trackingProfile =
        await getActiveDecryptedTrackingProfileForLandingPage(landingPage.id);

      if (trackingProfile) {
        metaPixelId = trackingProfile.pixel_id;
        capiResult = await sendMetaCapiEvent({
          pixelId: trackingProfile.pixel_id,
          accessToken: trackingProfile.access_token,
          eventName: payload.eventName,
          eventId: payload.eventId,
          eventSourceUrl: payload.sourceUrl,
          clientIpAddress: rawIp,
          clientUserAgent: userAgent,
          testEventCode: trackingProfile.test_event_code,
          publicCode: landingPage.public_code,
        });
      }
    } catch (error) {
      capiResult = getSafeCapiFailure(error);
    }

    // 5. Track Event (Upserts session, inserts tracking event with CAPI status)
    const result = await trackPublicEvent({
      payload,
      visitorId,
      sessionId,
      ipHash,
      userAgent,
      browser,
      os,
      deviceType: device_type,
      landingPage,
      metaPixelId,
      capiDeliveryStatus: capiResult.status as CapiDeliveryStatus,
      capiResponse: capiResult.response,
      capiError: capiResult.error ?? null,
      capiSentAt: capiResult.sentAt ?? null,
      trafficType: trafficClassification.trafficType,
      isBot: trafficClassification.isBot,
      botReason: trafficClassification.reason,
    });

    if (result.duplicate) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        capiStatus: capiResult.status,
        trafficType: trafficClassification.trafficType,
      });
    }

    return NextResponse.json({
      ok: true,
      capiStatus: capiResult.status,
      trafficType: trafficClassification.trafficType,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Landing page not found or inactive.") {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }
    
    console.error("[Tracking API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Unable to record event" },
      { status: 500 }
    );
  }
}
