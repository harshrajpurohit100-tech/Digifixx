"use client";

import { useEffect, useState } from "react";

type CountdownTextProps = {
  seconds: number;
  urgencyText?: string | null;
};

function formatRemainingSeconds(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) {
    return `00:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function CountdownText({ seconds, urgencyText }: CountdownTextProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [seconds]);

  return (
    <div className="mt-[22px] rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-center">
      <p className="text-sm font-semibold text-[#991B1B]">
        {urgencyText || "Invitation closes soon"}
      </p>
      <p className="mt-2 text-xl font-bold text-[#DC2626]">
        {remainingSeconds > 0
          ? `Invitation closes in ${formatRemainingSeconds(remainingSeconds)}`
          : "Invitation window ended"}
      </p>
    </div>
  );
}
