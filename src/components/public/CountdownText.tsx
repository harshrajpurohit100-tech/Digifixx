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
    <div className="mt-[22px] rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-3.5 py-3 text-center">
      <p className="text-[13px] font-bold text-[#9A3412]">
        {urgencyText || "Invitation closes soon"}
      </p>
      <p
        className={`mt-1 text-lg font-extrabold ${
          remainingSeconds > 0 ? "text-[#EA580C]" : "text-[#B91C1C]"
        }`}
      >
        {remainingSeconds > 0
          ? `Invitation closes in ${formatRemainingSeconds(remainingSeconds)}`
          : "Invitation window ended"}
      </p>
    </div>
  );
}
