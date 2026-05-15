import type { LucideIcon } from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { cn } from "@/lib/utils";

type StatCardTone = "default" | "success" | "warning" | "danger" | "info";

type StatCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: StatCardTone;
};

const toneClasses: Record<StatCardTone, string> = {
  default: "bg-[#F1F5F9] text-[#475569]",
  success: "bg-[#ECFDF5] text-[#16A34A]",
  warning: "bg-[#FFFBEB] text-[#D97706]",
  danger: "bg-[#FEF2F2] text-[#DC2626]",
  info: "bg-[#EFF6FF] text-[#2563EB]",
};

export function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  return (
    <AdminCard className="min-h-32" padding="md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[#64748B]">{title}</p>
          <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-[#0F172A]">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-[38px] items-center justify-center rounded-xl",
            toneClasses[tone]
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-[#64748B]">{helper}</p>
    </AdminCard>
  );
}
