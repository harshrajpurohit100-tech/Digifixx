import Image from "next/image";

type TelegramLogoProps = {
  logoUrl?: string | null;
  channelName?: string | null;
};

function getFallbackLetter(channelName?: string | null) {
  return (channelName?.trim().charAt(0) || "D").toUpperCase();
}

export function TelegramLogo({ logoUrl, channelName }: TelegramLogoProps) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={channelName ? `${channelName} logo` : "Telegram channel logo"}
        width={104}
        height={104}
        unoptimized
        className="size-[88px] rounded-full border-4 border-white object-cover shadow-[0_10px_24px_rgba(15,23,42,0.18)] sm:size-[104px]"
      />
    );
  }

  return (
    <div
      aria-label={channelName ? `${channelName} logo fallback` : "Logo fallback"}
      className="flex size-[88px] items-center justify-center rounded-full border-4 border-white bg-[#0F172A] text-4xl font-extrabold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] sm:size-[104px]"
    >
      {getFallbackLetter(channelName)}
    </div>
  );
}
