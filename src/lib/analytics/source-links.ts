const sourceMap: Record<string, string> = {
  "facebook.com": "https://facebook.com",
  facebook: "https://facebook.com",
  "instagram.com": "https://instagram.com",
  instagram: "https://instagram.com",
  "youtube.com": "https://youtube.com",
  youtube: "https://youtube.com",
  "youtu.be": "https://youtube.com",
  "reddit.com": "https://reddit.com",
  reddit: "https://reddit.com",
  "x.com": "https://x.com",
  twitter: "https://x.com",
  "twitter.com": "https://x.com",
  "linkedin.com": "https://linkedin.com",
  linkedin: "https://linkedin.com",
  telegram: "https://telegram.org",
  "telegram.org": "https://telegram.org",
  "t.me": "https://telegram.org",
};

function isDirectSource(source: string) {
  const normalized = source.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "direct" ||
    normalized === "unknown" ||
    normalized === "direct / unknown"
  );
}

function toSafeUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function getSourceOpenUrl(source: string) {
  if (isDirectSource(source)) {
    return null;
  }

  const trimmed = source.trim();
  const directUrl = toSafeUrl(trimmed);

  if (directUrl) {
    return directUrl;
  }

  const normalized = trimmed
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\/$/, "");

  if (sourceMap[normalized]) {
    return sourceMap[normalized];
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) {
    return `https://${normalized}`;
  }

  return null;
}
