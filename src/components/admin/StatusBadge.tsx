import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  active: "border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]",
  paused: "border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]",
  archived: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
  draft: "border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]",
  connected: "border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]",
  missing: "border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]",
  pending: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
};

const dotStyles: Record<string, string> = {
  active: "bg-[#10B981]",
  paused: "bg-[#EA580C]",
  archived: "bg-[#94A3B8]",
  draft: "bg-[#64748B]",
  connected: "bg-[#10B981]",
  missing: "bg-[#EA580C]",
  pending: "bg-[#2563EB]",
};

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        statusStyles[normalizedStatus] ??
          "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          dotStyles[normalizedStatus] ?? "bg-[#94A3B8]"
        )}
      />
      {formatStatus(status)}
    </Badge>
  );
}
