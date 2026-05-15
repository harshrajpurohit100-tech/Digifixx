import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingClasses: Record<NonNullable<AdminCardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function AdminCard({
  children,
  className,
  padding = "md",
}: AdminCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#E2E8F0] bg-white",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </section>
  );
}
