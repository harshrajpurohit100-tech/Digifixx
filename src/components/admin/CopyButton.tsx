"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className,
  ariaLabel,
  children,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className={cn(
        "h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]",
        className
      )}
    >
      {copied ? copiedLabel : (children ?? label)}
    </Button>
  );
}
