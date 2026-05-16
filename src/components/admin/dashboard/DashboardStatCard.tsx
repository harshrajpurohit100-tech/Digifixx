import type { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "info";
};

const toneClasses = {
  default: "bg-[#F1F5F9] text-[#475569]",
  success: "bg-[#ECFDF5] text-[#16A34A]",
  warning: "bg-[#FFFBEB] text-[#D97706]",
  info: "bg-[#EFF6FF] text-[#2563EB]",
};

export function DashboardStatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: DashboardStatCardProps) {
  return (
    <section className="rounded-[18px] border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[#64748B]">{title}</p>
          <p className="mt-3 text-[30px] font-extrabold leading-none tracking-[-0.02em] text-[#0F172A]">
            {value}
          </p>
        </div>
        <div
          className={`flex size-10 items-center justify-center rounded-[14px] ${toneClasses[tone]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-[#64748B]">{helper}</p>
    </section>
  );
}
