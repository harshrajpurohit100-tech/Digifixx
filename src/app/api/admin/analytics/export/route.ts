import { NextRequest } from "next/server";

import { parseAnalyticsSearchParams } from "@/lib/analytics/filter-params";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { formatIstDateTime } from "@/lib/date-format";
import { listAnalyticsEventsForExport } from "@/lib/repositories/tracking.repository";

export const dynamic = "force-dynamic";

const EXPORT_CHUNK_SIZE = 1000;
const MAX_EXPORT_ROWS = 50000;

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function getSourceLabel(event: {
  utm_source: string | null;
  referrer: string | null;
}) {
  if (event.utm_source) {
    return event.utm_source;
  }

  if (!event.referrer) {
    return "Direct";
  }

  try {
    return new URL(event.referrer).hostname;
  } catch {
    return "Direct";
  }
}

function rowToCsv(event: Awaited<ReturnType<typeof listAnalyticsEventsForExport>>[number]) {
  return [
    formatIstDateTime(event.created_at),
    event.event_name,
    event.traffic_type,
    event.capi_delivery_status,
    getSourceLabel(event),
    event.landing_page_public_code
      ? `/p/${event.landing_page_public_code}`
      : event.landing_page_name,
    event.event_id,
    event.visitor_id,
    event.session_id,
  ]
    .map(csvCell)
    .join(",");
}

export async function GET(req: NextRequest) {
  const adminUser = await getAdminUser();

  if (!adminUser.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (adminUser.profile?.status !== "active") {
    return new Response("Forbidden", { status: 403 });
  }

  const filters = parseAnalyticsSearchParams(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          [
            "Timestamp",
            "Event Name",
            "Traffic Type",
            "CAPI Status",
            "Source",
            "Landing Page",
            "Event ID",
            "Visitor ID",
            "Session ID",
          ]
            .map(csvCell)
            .join(",") + "\n"
        )
      );

      let offset = 0;
      let exported = 0;

      while (exported < MAX_EXPORT_ROWS) {
        const events = await listAnalyticsEventsForExport({
          landingPageId: filters.pageId,
          dateRange: filters.dateRange,
          search: filters.search,
          eventType: filters.eventType,
          trafficType: filters.trafficType,
          capiStatus: filters.capiStatus,
          offset,
          limit: EXPORT_CHUNK_SIZE,
        });

        if (events.length === 0) {
          break;
        }

        controller.enqueue(
          encoder.encode(events.map(rowToCsv).join("\n") + "\n")
        );

        exported += events.length;
        offset += events.length;

        if (events.length < EXPORT_CHUNK_SIZE) {
          break;
        }
      }

      controller.close();
    },
  });

  const filename = `digifixx-analytics-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
