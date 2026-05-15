import { CheckCircle2, Send } from "lucide-react";

import { CountdownText } from "@/components/public/CountdownText";
import { TelegramLogo } from "@/components/public/TelegramLogo";
import {
  DEFAULT_CTA_BUTTON_TEXT,
  DEFAULT_FOOTER_NOTE,
  DEFAULT_SUPPORT_LINE_1,
  DEFAULT_SUPPORT_LINE_2,
  DEFAULT_TOP_NOTICE_TEXT,
} from "@/lib/landing-page-defaults";
import { getTelegramDownloadUrl } from "@/lib/telegram";
import { isSafeHttpUrl } from "@/lib/url";
import type { PublicLandingPage } from "@/types/digifixx";

type PublicTelegramPageProps = {
  page: PublicLandingPage;
};

function NoticeText({ text }: { text: string }) {
  if (text === DEFAULT_TOP_NOTICE_TEXT) {
    return (
      <>
        {"Don't have "}
        <span className="font-extrabold underline decoration-white/75 underline-offset-2">
          Telegram
        </span>
        {" yet? Try it now!"}
      </>
    );
  }

  return <>{text}</>;
}

function formatSubscriberCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function PublicTelegramPage({ page }: PublicTelegramPageProps) {
  const channelName = page.channel_name || page.page_title || "Telegram Channel";
  const noticeText = page.top_notice_text || DEFAULT_TOP_NOTICE_TEXT;
  const supportLine1 = page.support_line_1 || DEFAULT_SUPPORT_LINE_1;
  const supportLine2 = page.support_line_2 || DEFAULT_SUPPORT_LINE_2;
  const footerNote = page.footer_note || DEFAULT_FOOTER_NOTE;
  const ctaText = page.cta_button_text || DEFAULT_CTA_BUTTON_TEXT;
  const hasValidTelegramUrl = isSafeHttpUrl(page.primary_button_url);
  const shouldShowCountdown =
    page.is_countdown_enabled && page.countdown_seconds > 0;
  const telegramDownloadUrl = getTelegramDownloadUrl();

  return (
    <main className="min-h-screen bg-[#F4F7FB] text-[#0F172A]">
      <a
        href={telegramDownloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-10 items-center justify-center bg-[#0EA5E9] px-4 py-2 text-center text-[13px] font-bold leading-5 text-white transition-colors hover:bg-[#0284C7] sm:min-h-[42px] sm:text-sm"
      >
        <NoticeText text={noticeText} />
      </a>

      <div className="mx-auto flex w-full max-w-[430px] flex-col px-4 pb-6 pt-[22px] sm:max-w-[520px] sm:px-8 sm:pb-10 sm:pt-12">
        <section className="rounded-3xl border border-[#E2E8F0] bg-white px-5 py-6 text-center shadow-[0_14px_35px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:px-9 sm:py-9 sm:shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
          <div className="flex justify-center">
            <TelegramLogo logoUrl={page.logo_url} channelName={channelName} />
          </div>

          <h1 className="mt-[22px] text-[25px] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#0F172A] sm:mt-6 sm:text-[32px] sm:leading-[1.1]">
            {channelName}
          </h1>

          {page.subscriber_count !== null ? (
            <p className="mt-2 text-[13px] font-medium text-[#64748B]">
              {formatSubscriberCount(page.subscriber_count)} subscribers
            </p>
          ) : null}

          <div className="mx-auto mt-6 max-w-[420px] sm:mt-[26px]">
            <p className="text-[15px] font-medium leading-[1.5] text-[#1E293B] sm:text-base">
              {supportLine1}
            </p>
            <p className="mt-2 text-sm font-normal leading-[1.5] text-[#475569] sm:text-[15px]">
              {supportLine2}
            </p>
          </div>

          {shouldShowCountdown ? (
            <CountdownText
              seconds={page.countdown_seconds}
              urgencyText={page.urgency_text}
            />
          ) : null}

          <div className="mt-[22px] inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1.5 text-[11px] font-semibold text-[#166534]">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Secure Telegram redirect
          </div>

          <div className="mt-5 flex justify-center">
            {hasValidTelegramUrl ? (
              <a
                href={page.primary_button_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[50px] w-full max-w-[340px] items-center justify-center gap-2 rounded-[14px] bg-[#0284C7] px-[22px] text-[15px] font-extrabold text-white shadow-[0_10px_20px_rgba(2,132,199,0.22)] transition-colors hover:bg-[#0369A1] active:bg-[#075985] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0284C7]"
              >
                <Send className="size-[17px]" aria-hidden="true" />
                {ctaText}
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-[50px] w-full max-w-[340px] cursor-not-allowed items-center justify-center rounded-[14px] bg-[#94A3B8] px-[22px] text-[15px] font-extrabold text-white"
              >
                Telegram link unavailable
              </button>
            )}
          </div>

          <p className="mx-auto mt-5 max-w-[400px] text-center text-[12.5px] leading-[1.5] text-[#64748B] sm:text-[13px]">
            {footerNote}
          </p>

          <p className="mt-6 text-center text-[11.5px] font-medium text-[#94A3B8]">
            {page.maintained_by_text || "Maintained by Digifixx"}
          </p>

          {page.disclaimer ? (
            <p className="mt-[18px] border-t border-[#E2E8F0] pt-3.5 text-center text-[11px] leading-[1.5] text-[#94A3B8]">
              {page.disclaimer}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
