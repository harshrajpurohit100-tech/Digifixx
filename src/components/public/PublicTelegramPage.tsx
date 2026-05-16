import { CheckCircle2 } from "lucide-react";

import { CountdownText } from "@/components/public/CountdownText";
import { PublicPageTrackingBridge } from "@/components/public/PublicPageTrackingBridge";
import { TelegramCtaButton } from "@/components/public/TelegramCtaButton";
import { TelegramLogo } from "@/components/public/TelegramLogo";
import {
  DEFAULT_CTA_BUTTON_TEXT,
  DEFAULT_FOOTER_NOTE,
  DEFAULT_SUPPORT_LINE_1,
  DEFAULT_SUPPORT_LINE_2,
  DEFAULT_TOP_NOTICE_TEXT,
  DEFAULT_CTA_INSTRUCTION_LINE,
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
      <PublicPageTrackingBridge
        publicCode={page.public_code}
        tracking={page.tracking}
      />

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

          <p className="mt-5 text-center text-[14px] font-[800] leading-[1.4] text-[#0F172A] sm:text-[15px]">
            {DEFAULT_CTA_INSTRUCTION_LINE}
          </p>

          <div className="mt-5 flex justify-center">
            <TelegramCtaButton
              href={page.primary_button_url}
              label={ctaText}
              publicCode={page.public_code}
              hasValidUrl={hasValidTelegramUrl}
              tracking={page.tracking}
            />
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
