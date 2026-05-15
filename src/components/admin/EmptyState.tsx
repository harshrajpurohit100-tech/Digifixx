import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center",
        className
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#475569]">
        <Icon className="size-[19px]" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[#0F172A]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[13px] leading-5 text-[#64748B]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
