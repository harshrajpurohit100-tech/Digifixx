import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Button } from "@/components/ui/button";
import type { DashboardOverview } from "@/lib/repositories/dashboard.repository";

type RecentActivityCardProps = {
  events: DashboardOverview["recentEvents"];
};

function formatEventText(event: DashboardOverview["recentEvents"][number]) {
  const pageLabel = event.channel_name
    ? event.channel_name
    : event.public_code
      ? `/p/${event.public_code}`
      : "a landing page";

  if (event.capi_delivery_status === "sent") {
    return `${event.event_name} recorded and CAPI sent for ${pageLabel}`;
  }

  return `${event.event_name} recorded on ${pageLabel}`;
}

export function RecentActivityCard({ events }: RecentActivityCardProps) {
  return (
    <AdminCard className="h-full">
      <SectionHeader
        title="Recent Activity"
        action={
          <Button
            asChild
            variant="outline"
            className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
          >
            <Link href="/admin/analytics">
              View analytics
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {events.length > 0 ? (
        <div className="mt-5 divide-y divide-[#E2E8F0]">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#475569]">
                <Clock3 className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#0F172A]">
                  {formatEventText(event)}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {formatDistanceToNow(new Date(event.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center">
          <p className="text-sm font-bold text-[#0F172A]">No activity yet</p>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            Public landing page visits and button clicks will appear here.
          </p>
        </div>
      )}
    </AdminCard>
  );
}
