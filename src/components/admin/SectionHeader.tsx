import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h2 className="text-xl font-bold leading-tight text-[#0F172A]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
