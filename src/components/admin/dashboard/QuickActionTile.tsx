import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type QuickActionTileProps = {
  title: string;
  helper: string;
  href: string;
  icon: LucideIcon;
};

export function QuickActionTile({
  title,
  helper,
  href,
  icon: Icon,
}: QuickActionTileProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:border-[#BFDBFE] hover:bg-[#F8FAFC]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] transition-colors group-hover:bg-[#DBEAFE]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#0F172A]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#64748B]">
          {helper}
        </span>
      </span>
    </Link>
  );
}
