import {
  Activity,
  BarChart3,
  Globe2,
  RadioTower,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

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
    halo: "shadow-[0_0_14px_rgba(22,163,74,0.45)]",
  },
  needs_setup: {
    label: "Needs setup",
    dot: "bg-[#D97706]",
    text: "text-[#92400E]",
    halo: "",
  },
  inactive: {
    label: "Inactive",
    dot: "bg-[#94A3B8]",
    text: "text-[#475569]",
    halo: "",
  },
};

function HealthRow({
  label,
  status,
  icon: Icon,
}: {
  label: string;
  status: keyof typeof statusConfig;
  icon: LucideIcon;
}) {
  const config = statusConfig[status];

  return (
    <div className="flex h-12 items-center justify-between gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-white text-[#2563EB] shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-[#0F172A]">{label}</span>
      </div>
      <span
        className={`inline-flex items-center gap-2 text-xs font-bold ${config.text}`}
      >
        <span className={`size-2 rounded-full ${config.dot} ${config.halo}`} />
        {config.label}
      </span>
    </div>
  );
}

export function TrackingHealthCard({ health }: TrackingHealthCardProps) {
  return (
    <AdminCard
      className="rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      padding="lg"
    >
      <SectionHeader
        title="Tracking Health"
        description="Current status of page tracking."
        action={
          <span className="flex size-9 items-center justify-center rounded-[12px] bg-[#EFF6FF] text-[#2563EB]">
            <Activity className="size-5" aria-hidden="true" />
          </span>
        }
      />
      <div className="mt-5 grid gap-3">
        <HealthRow
          label="Internal Tracking API"
          status={health.internalTracking}
          icon={RadioTower}
        />
        <HealthRow
          label="Meta Pixel"
          status={health.metaPixel}
          icon={BarChart3}
        />
        <HealthRow
          label="Meta CAPI"
          status={health.metaCapi}
          icon={ShieldCheck}
        />
        <HealthRow
          label="Public Pages"
          status={health.publicPages}
          icon={Globe2}
        />
      </div>
    </AdminCard>
  );
}
