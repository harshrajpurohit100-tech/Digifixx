export function parseUserAgent(userAgent: string | null): {
  browser: string | null;
  os: string | null;
  device_type: string | null;
} {
  if (!userAgent) {
    return { browser: null, os: null, device_type: null };
  }

  let device_type = "desktop";
  if (/mobile|iphone|android|windows phone/i.test(userAgent)) {
    device_type = "mobile";
  } else if (/ipad|tablet|kindle|playbook|silk/i.test(userAgent)) {
    device_type = "tablet";
  }

  let os = "Unknown";
  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/mac os x/i.test(userAgent)) os = "macOS";
  else if (/ios|iphone|ipad|ipod/i.test(userAgent)) os = "iOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/linux/i.test(userAgent)) os = "Linux";

  let browser = "Unknown";
  // Check for in-app browsers first
  if (/instagram/i.test(userAgent)) browser = "Instagram Browser";
  else if (/fbav|fban|facebook/i.test(userAgent)) browser = "Facebook Browser";
  else if (/telegram/i.test(userAgent)) browser = "Telegram Browser";
  // Then standard browsers
  else if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/chrome|crios/i.test(userAgent)) browser = "Chrome"; // Chrome needs to be before Safari since Chrome UA contains Safari
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";

  return { browser, os, device_type };
}
