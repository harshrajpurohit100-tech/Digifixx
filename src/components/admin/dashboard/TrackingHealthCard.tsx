import { Activity } from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { SectionHeader } from "@/components/admin/SectionHeader";
import type { DashboardOverview } from "@/lib/repositories/dashboard.repository";

type TrackingHealthCardProps = {
  health: DashboardOverview["trackingHealth"];
};

const statusConfig = {
  active: {
    label: "Active",
    dot: "bg-[#16A34A]",
    text: "text-[#166534]",
  },
  needs_setup: {
    label: "Needs setup",
    dot: "bg-[#D97706]",
    text: "text-[#92400E]",
  },
  inactive: {
    label: "Inactive",
    dot: "bg-[#94A3B8]",
    text: "text-[#475569]",
  },
};

function HealthRow({
  label,
  status,
}: {
  label: string;
  status: keyof typeof statusConfig;
}) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className={`size-2.5 rounded-full ${config.dot}`} />
        <span className="text-sm font-semibold text-[#0F172A]">{label}</span>
      </div>
      <span className={`text-xs font-bold ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}

export function TrackingHealthCard({ health }: TrackingHealthCardProps) {
  return (
    <AdminCard>
      <SectionHeader
        title="Tracking Health"
        description="Current status of public page tracking."
        action={<Activity className="size-5 text-[#2563EB]" />}
      />
      <div className="mt-5 grid gap-3">
        <HealthRow label="Internal Tracking API" status={health.internalTracking} />
        <HealthRow label="Meta Pixel" status={health.metaPixel} />
        <HealthRow label="Meta CAPI" status={health.metaCapi} />
        <HealthRow label="Public Pages" status={health.publicPages} />
      </div>
    </AdminCard>
  );
}
