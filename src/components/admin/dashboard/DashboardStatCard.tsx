import type { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "info";
};

const toneClasses = {
  default:
    "bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB] shadow-[0_16px_30px_rgba(37,99,235,0.14)]",
  success:
    "bg-gradient-to-br from-[#ECFDF5] to-[#DCFCE7] text-[#16A34A] shadow-[0_16px_30px_rgba(22,163,74,0.12)]",
  warning:
    "bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-[#EA580C] shadow-[0_16px_30px_rgba(234,88,12,0.12)]",
  info: "bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-[#6D28D9] shadow-[0_16px_30px_rgba(109,40,217,0.12)]",
};

export function DashboardStatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: DashboardStatCardProps) {
  return (
    <section className="group relative min-h-[158px] overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]">
      <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-[#2563EB]/[0.04] blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold text-[#334155]">{title}</p>
          <p className="mt-4 text-[32px] font-extrabold leading-none tracking-[-0.02em] text-[#020617]">
            {value}
          </p>
        </div>
        <div
          className={`flex size-14 items-center justify-center rounded-[18px] transition-transform duration-200 ease-out group-hover:scale-[1.04] ${toneClasses[tone]}`}
        >
          <Icon className="size-[26px]" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-5 text-xs font-medium leading-5 text-[#64748B]">
        {helper}
      </p>
    </section>
  );
}
