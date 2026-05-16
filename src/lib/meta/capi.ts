import "server-only";

import { isValidMetaPixelId, normalizeMetaEventName } from "@/lib/meta-pixel";
import { isSafeHttpUrl } from "@/lib/url";
import type { CapiDeliveryStatus, TrackingEventName } from "@/types/digifixx";

export const META_GRAPH_API_VERSION = "v21.0";

export type MetaCapiSendInput = {
  pixelId: string | null | undefined;
  accessToken: string | null | undefined;
  eventName: TrackingEventName;
  eventId: string;
  eventSourceUrl: string;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  testEventCode?: string | null;
  publicCode: string;
};

export type MetaCapiSendResult = {
  status: Extract<CapiDeliveryStatus, "sent" | "failed" | "skipped">;
  response?: unknown;
  error?: string;
  sentAt?: string;
};

function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 300);
  }

  return "Meta CAPI request failed.";
}

async function parseMetaResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return {
      status: response.status,
      statusText: response.statusText,
    };
  }
}

export async function sendMetaCapiEvent(
  input: MetaCapiSendInput
): Promise<MetaCapiSendResult> {
  if (
    !input.pixelId ||
    !isValidMetaPixelId(input.pixelId) ||
    !input.accessToken ||
    !input.eventId ||
    !isSafeHttpUrl(input.eventSourceUrl)
  ) {
    return {
      status: "skipped",
      error: "Missing or invalid CAPI configuration.",
    };
  }

  const eventName = normalizeMetaEventName(input.eventName, "Lead");
  const endpoint = new URL(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${input.pixelId}/events`
  );
  endpoint.searchParams.set("access_token", input.accessToken);

  const eventPayload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    event_source_url: input.eventSourceUrl,
    user_data: {
      ...(input.clientIpAddress
        ? { client_ip_address: input.clientIpAddress }
        : {}),
      ...(input.clientUserAgent
        ? { client_user_agent: input.clientUserAgent }
        : {}),
    },
    custom_data: {
      content_name: input.publicCode,
      content_category: "telegram_landing_page",
    },
  };

  const requestBody = {
    data: [eventPayload],
    ...(input.testEventCode
      ? { test_event_code: input.testEventCode }
      : {}),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const responseBody = await parseMetaResponse(response);
    const sentAt = new Date().toISOString();

    if (response.ok) {
      return {
        status: "sent",
        response: responseBody,
        sentAt,
      };
    }

    return {
      status: "failed",
      response: responseBody,
      error: `Meta CAPI rejected event with HTTP ${response.status}.`,
      sentAt,
    };
  } catch (error) {
    return {
      status: "failed",
      error: getSafeErrorMessage(error),
      sentAt: new Date().toISOString(),
    };
  }
}
