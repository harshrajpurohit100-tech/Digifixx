import { createHash } from "crypto";
import { NextRequest } from "next/server";

export function getRequestIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  return null;
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;

  const salt = process.env.TRACKING_SALT || process.env.ENCRYPTION_SECRET;
  
  if (!salt) {
    // If no salt is available, do not store raw IP for privacy.
    return null;
  }

  return createHash("sha256")
    .update(`${ip}:${salt}`)
    .digest("hex");
}
