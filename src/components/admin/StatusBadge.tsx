import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  active: "border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]",
  paused: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
  archived: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  draft: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  connected: "border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]",
  missing: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
  pending: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
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
        statusStyles[normalizedStatus] ??
          "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
        className
      )}
    >
      {formatStatus(status)}
    </Badge>
  );
}
