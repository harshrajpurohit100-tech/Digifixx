import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

type QuickActionTileProps = {
  title: string;
  helper: string;
  href: string;
  icon: LucideIcon;
  tone?: "purple" | "green" | "blue" | "orange";
};

const toneClasses = {
  purple:
    "bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-[#6D28D9] group-hover:shadow-[0_12px_22px_rgba(109,40,217,0.14)]",
  green:
    "bg-gradient-to-br from-[#ECFDF5] to-[#DCFCE7] text-[#16A34A] group-hover:shadow-[0_12px_22px_rgba(22,163,74,0.12)]",
  blue: "bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB] group-hover:shadow-[0_12px_22px_rgba(37,99,235,0.14)]",
  orange:
    "bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-[#EA580C] group-hover:shadow-[0_12px_22px_rgba(234,88,12,0.12)]",
};

export function QuickActionTile({
  title,
  helper,
  href,
  icon: Icon,
  tone = "blue",
}: QuickActionTileProps) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[92px] items-center gap-3 overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:bg-[#F8FAFC] hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
    >
      <span
        className={`flex size-[50px] shrink-0 items-center justify-center rounded-[16px] transition-all duration-200 ease-out ${toneClasses[tone]}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#0F172A]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#64748B]">
          {helper}
        </span>
      </span>
      <ArrowUpRight
        className="ml-auto size-4 shrink-0 text-[#94A3B8] opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#2563EB] group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}
