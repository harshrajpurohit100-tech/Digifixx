import { NextRequest, NextResponse } from "next/server";
import { trackingPayloadSchema } from "@/lib/validations/tracking";
import { trackPublicEvent } from "@/lib/repositories/tracking.repository";
import { getOrCreateTrackingCookies } from "@/lib/tracking/cookies";
import { getRequestIp, hashIp } from "@/lib/tracking/ip";
import { parseUserAgent } from "@/lib/tracking/user-agent";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    
    // 1. Basic length guard before parsing
    if (JSON.stringify(rawBody).length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Payload too large" },
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

    // 3. Resolve Cookies
    const { visitorId, sessionId } = await getOrCreateTrackingCookies();

    // 4. Resolve IP and User Agent
    const rawIp = getRequestIp(req);
    const ipHash = hashIp(rawIp);
    const userAgent = req.headers.get("user-agent");
    const { browser, os, device_type } = parseUserAgent(userAgent);

    // 5. Track Event (Upserts session, inserts tracking event)
    const result = await trackPublicEvent({
      payload,
      visitorId,
      sessionId,
      ipHash,
      userAgent,
      browser,
      os,
      deviceType: device_type,
    });

    if (result.duplicate) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    return NextResponse.json({ ok: true });
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
