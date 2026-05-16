import { cookies } from "next/headers";
import { customAlphabet } from "nanoid";

const generateRandomId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 32);

export type TrackingCookies = {
  visitorId: string;
  sessionId: string;
};

export async function getOrCreateTrackingCookies(): Promise<TrackingCookies> {
  const cookieStore = await cookies();
  
  let visitorId = cookieStore.get("dx_visitor_id")?.value;
  let sessionId = cookieStore.get("dx_session_id")?.value;
  
  let needsVisitorSet = false;
  let needsSessionSet = false;

  if (!visitorId || visitorId.length < 16) {
    visitorId = `v_${generateRandomId()}`;
    needsVisitorSet = true;
  }

  if (!sessionId || sessionId.length < 16) {
    sessionId = `s_${generateRandomId()}`;
    needsSessionSet = true;
  }

  if (needsVisitorSet) {
    cookieStore.set({
      name: "dx_visitor_id",
      value: visitorId,
      maxAge: 60 * 60 * 24 * 180, // 180 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  }

  if (needsSessionSet) {
    cookieStore.set({
      name: "dx_session_id",
      value: sessionId,
      maxAge: 60 * 60 * 2, // 2 hours is better for standard sessions than 30 mins
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  }

  return { visitorId, sessionId };
}
