import type { TrafficType } from "@/types/digifixx";

type TrafficClassifierInput = {
  userAgent: string | null;
  acceptLanguage?: string | null;
  secFetchMode?: string | null;
  secFetchDest?: string | null;
  secFetchSite?: string | null;
};

type TrafficClassification = {
  trafficType: TrafficType;
  isBot: boolean;
  reason: string | null;
};

const systemPreviewAgents = [
  "facebookexternalhit",
  "facebot",
  "meta-externalagent",
  "whatsapp",
  "telegrambot",
  "twitterbot",
  "linkedinbot",
  "discordbot",
  "slackbot",
  "pinterestbot",
];

const searchCrawlerAgents = [
  "googlebot",
  "bingbot",
  "duckduckbot",
  "yandexbot",
  "baiduspider",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "petalbot",
];

const genericBotPatterns = [
  "bot",
  "crawler",
  "spider",
  "scrape",
  "python-requests",
  "curl",
  "wget",
  "headless",
  "phantom",
  "playwright",
  "puppeteer",
];

const browserMarkers = [
  "chrome",
  "safari",
  "firefox",
  "edg",
  "crios",
  "fxios",
  "mobile",
  "android",
  "iphone",
];

function containsAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

export function classifyTraffic(
  input: TrafficClassifierInput
): TrafficClassification {
  const normalizedUserAgent = input.userAgent?.trim().toLowerCase() ?? "";

  if (!normalizedUserAgent) {
    return {
      trafficType: "unknown",
      isBot: false,
      reason: "missing_user_agent",
    };
  }

  if (containsAny(normalizedUserAgent, systemPreviewAgents)) {
    return {
      trafficType: "system",
      isBot: true,
      reason: "social_or_platform_preview",
    };
  }

  if (containsAny(normalizedUserAgent, searchCrawlerAgents)) {
    return {
      trafficType: "bot",
      isBot: true,
      reason: "search_or_seo_crawler",
    };
  }

  if (containsAny(normalizedUserAgent, genericBotPatterns)) {
    return {
      trafficType: "bot",
      isBot: true,
      reason: "generic_bot_pattern",
    };
  }

  if (containsAny(normalizedUserAgent, browserMarkers)) {
    return {
      trafficType: "human",
      isBot: false,
      reason: null,
    };
  }

  return {
    trafficType: "unknown",
    isBot: false,
    reason: "unrecognized_user_agent",
  };
}
