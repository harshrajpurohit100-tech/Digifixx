import { CheckCircle2, Send } from "lucide-react";

import { CountdownText } from "@/components/public/CountdownText";
import { TelegramLogo } from "@/components/public/TelegramLogo";
import { isSafeHttpUrl } from "@/lib/url";
import type { PublicLandingPage } from "@/types/digifixx";

type PublicTelegramPageProps = {
  page: PublicLandingPage;
};

const defaultNoticeText = "Don't have Telegram yet? Try it now!";
const defaultFooterNote =
  "If you have Telegram, you can view and join this channel right away.";

function NoticeText({ text }: { text: string }) {
  const telegramIndex = text.toLowerCase().indexOf("telegram");

  if (telegramIndex === -1) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, telegramIndex)}
      <span className="font-extrabold underline decoration-white/70 underline-offset-4">
        {text.slice(telegramIndex, telegramIndex + "telegram".length)}
      </span>
      {text.slice(telegramIndex + "telegram".length)}
    </>
  );
}

function formatSubscriberCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function PublicTelegramPage({ page }: PublicTelegramPageProps) {
  const channelName = page.channel_name || page.page_title || "Telegram Channel";
  const noticeText = page.top_notice_text || defaultNoticeText;
  const footerNote = page.footer_note || defaultFooterNote;
  const ctaText = page.cta_button_text || "VIEW IN TELEGRAM";
  const hasValidTelegramUrl = isSafeHttpUrl(page.primary_button_url);
  const shouldShowCountdown =
    page.is_countdown_enabled && page.countdown_seconds > 0;
  const hasSupportContent = Boolean(page.support_line_1 || page.support_line_2);

  return (
    <main className="min-h-screen bg-[#F3F6FA] text-[#0F172A]">
      <div className="flex min-h-[38px] items-center justify-center bg-[#0EA5E9] px-4 py-2 text-center text-sm font-semibold leading-5 text-white sm:min-h-10">
        <NoticeText text={noticeText} />
      </div>

      <div className="mx-auto flex w-full max-w-[560px] flex-col px-5 py-8 sm:px-8 sm:py-12">
        <section className="rounded-[28px] border border-[#E2E8F0] bg-white px-6 py-7 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-9 sm:py-9">
          <div className="flex justify-center">
            <TelegramLogo logoUrl={page.logo_url} channelName={channelName} />
          </div>

          <h1 className="mt-6 text-[26px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0F172A] sm:text-[32px]">
            {channelName}
          </h1>

          {page.subscriber_count !== null ? (
            <p className="mt-2 text-[13px] font-medium text-[#64748B]">
              {formatSubscriberCount(page.subscriber_count)} subscribers
            </p>
          ) : null}

          {page.support_line_1 ? (
            <p className="mx-auto mt-6 max-w-[460px] text-base font-medium leading-7 text-[#0F172A]">
              {page.support_line_1}
            </p>
          ) : null}

          {page.support_line_2 ? (
            <p className="mx-auto mt-3 max-w-[460px] text-[15px] font-normal leading-7 text-[#334155]">
              {page.support_line_2}
            </p>
          ) : null}

          {shouldShowCountdown ? (
            <CountdownText
              seconds={page.countdown_seconds}
              urgencyText={page.urgency_text}
            />
          ) : null}

          {hasSupportContent ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-[#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[#166534]">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Secure Telegram redirect
            </div>
          ) : null}

          <div className="mt-7 flex justify-center">
            {hasValidTelegramUrl ? (
              <a
                href={page.primary_button_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-[22px] text-[15px] font-bold text-white transition-colors hover:bg-[#0369A1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0284C7]"
              >
                <Send className="size-[17px]" aria-hidden="true" />
                {ctaText}
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-12 w-full max-w-[320px] cursor-not-allowed items-center justify-center rounded-xl bg-[#94A3B8] px-[22px] text-[15px] font-bold text-white"
              >
                Telegram link unavailable
              </button>
            )}
          </div>

          <p className="mt-[22px] text-center text-[13px] leading-6 text-[#64748B]">
            {footerNote}
          </p>

          <p className="mt-7 text-center text-xs font-medium text-[#94A3B8]">
            {page.maintained_by_text || "Maintained by Digifixx"}
          </p>

          {page.disclaimer ? (
            <p className="mt-5 border-t border-[#E2E8F0] pt-4 text-center text-[11px] leading-5 text-[#94A3B8]">
              {page.disclaimer}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
