import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Info,
  Send,
} from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { LandingPageEditForm } from "@/components/admin/LandingPageEditForm";
import { Button } from "@/components/ui/button";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import { listClients } from "@/lib/repositories/clients.repository";
import { getLandingPageDetail } from "@/lib/repositories/landing-pages.repository";

export const dynamic = "force-dynamic";

type LandingPageEditPageProps = {
  params: Promise<{
    landingPageId: string;
  }>;
};

/* ── Right column: Live Preview card (read-only, uses saved data) ── */
function LivePreviewCard({
  logoUrl,
  channelName,
  subscriberCount,
  topNoticeText,
  supportLine1,
  supportLine2,
  ctaButtonText,
  footerNote,
}: {
  logoUrl: string | null;
  channelName: string | null;
  subscriberCount: number | null;
  topNoticeText: string;
  supportLine1: string | null;
  supportLine2: string | null;
  ctaButtonText: string;
  footerNote: string | null;
}) {
  const displayName = channelName || "Channel Name";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-[#0F172A]">Live Preview</p>
          <p className="text-[11px] text-[#94A3B8]">Read Only · Saved values</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
          <Eye className="size-[18px]" />
        </div>
      </div>

      {/* Mock page */}
      <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC]">
        {/* Top notice bar */}
        <div className="flex h-8 items-center justify-center bg-[#0EA5E9] px-3 text-center text-[11px] font-bold text-white">
          {topNoticeText}
        </div>

        {/* Page body */}
        <div className="px-5 pb-5 pt-4 text-center">
          {/* Logo */}
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={displayName}
              className="mx-auto size-[60px] rounded-full border-[3px] border-white object-cover shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
            />
          ) : (
            <div className="mx-auto flex size-[60px] items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] text-xl font-extrabold text-[#2563EB] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
              {initial}
            </div>
          )}

          {/* Channel name */}
          <h3 className="mt-3 text-[16px] font-extrabold tracking-[-0.02em] text-[#0F172A]">
            {displayName}
          </h3>

          {/* Subscribers */}
          {subscriberCount != null && (
            <p className="mt-0.5 text-[12px] font-medium text-[#64748B]">
              {subscriberCount.toLocaleString("en-IN")} subscribers
            </p>
          )}

          {/* Support lines */}
          {(supportLine1 || supportLine2) && (
            <div className="mt-4 flex flex-col gap-2 text-left">
              {supportLine1 && (
                <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2.5 text-[12px] font-semibold leading-[1.4] text-[#1E293B]">
                  {supportLine1}
                </div>
              )}
              {supportLine2 && (
                <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2.5 text-[12px] font-semibold leading-[1.4] text-[#1E293B]">
                  {supportLine2}
                </div>
              )}
            </div>
          )}

          {/* CTA button */}
          <div className="mt-4 flex h-[38px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#0284C7] text-[13px] font-extrabold text-white shadow-[0_8px_18px_rgba(2,132,199,0.22)]">
            <Send className="size-[14px]" />
            {ctaButtonText}
          </div>

          {/* Footer */}
          {footerNote && (
            <p className="mt-3 border-t border-[#E2E8F0] pt-3 text-[11px] leading-[1.5] text-[#94A3B8]">
              {footerNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Right column: Detail link card ── */
function DetailLinkCard({ landingPageId }: { landingPageId: string }) {
  return (
    <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
      <p className="text-[13px] font-medium text-[#475569]">
        The full public preview is available on the detail page.
      </p>
      <Button
        asChild
        variant="outline"
        className="mt-4 h-9 w-full justify-center rounded-[10px] border-[#E2E8F0] text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC]"
      >
        <Link href={`/admin/landing-pages/${landingPageId}`}>
          View Landing Page Detail →
        </Link>
      </Button>
    </div>
  );
}

/* ── Right column: About editing card ── */
function AboutEditingCard() {
  return (
    <div className="rounded-[18px] border border-[#BFDBFE] bg-[#EFF6FF]/60 p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
          <Info className="size-[16px]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#1E40AF]">About Editing</p>
          <p className="mt-1.5 text-[12px] leading-[1.6] text-[#3B82F6]">
            Changes saved here will be reflected on the public Telegram landing page.
            The page must be set to <strong>Active</strong> to be publicly accessible.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function LandingPageEditPage({ params }: LandingPageEditPageProps) {
  const adminUser = await requireAdminUser();
  const { landingPageId } = await params;

  const [page, clients] = await Promise.all([
    getLandingPageDetail(landingPageId),
    listClients(),
  ]);

  if (!page) {
    notFound();
  }

  const plainLandingPage = {
    id: page.id,
    client_id: page.client_id,
    internal_name: page.internal_name,
    status: page.status,
    channel_name: page.channel_name,
    logo_url: page.logo_url,
    subscriber_count: page.subscriber_count,
    top_notice_text: page.top_notice_text,
    support_line_1: page.support_line_1,
    support_line_2: page.support_line_2,
    cta_button_text: page.cta_button_text,
    primary_button_url: page.primary_button_url,
    footer_note: page.footer_note,
    is_countdown_enabled: page.is_countdown_enabled,
    countdown_seconds: page.countdown_seconds,
    urgency_text: page.urgency_text,
    tracking: page.tracking_profile
      ? {
          pixel_id: page.tracking_profile.pixel_id,
          capi_token_last4: page.tracking_profile.capi_token_last4,
          test_event_code: page.tracking_profile.test_event_code,
          default_click_event: page.tracking_profile.default_click_event,
        }
      : null,
  };

  const plainClients = clients.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
  }));

  return (
    <AdminShell
      title="Edit Landing Page"
      description="Update Telegram page content, public status, and Meta tracking configuration."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="relative flex flex-col gap-5">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute right-0 top-0 -z-10 size-[380px] rounded-full bg-[#7C3AED]/[0.07] blur-3xl" />

        {/* Top action row */}
        <div className="flex items-center justify-end">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-[12px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <Link href={`/admin/landing-pages/${landingPageId}`}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Detail
            </Link>
          </Button>
        </div>

        {/* Main 2-column grid */}
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(340px,0.9fr)] gap-6">
          {/* Left: Form */}
          <div className="rounded-[22px] border border-[#E2E8F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <LandingPageEditForm
              clients={plainClients}
              landingPage={plainLandingPage}
            />
          </div>

          {/* Right: Context column */}
          <div className="flex flex-col gap-4 self-start sticky top-24">
            <LivePreviewCard
              logoUrl={plainLandingPage.logo_url}
              channelName={plainLandingPage.channel_name}
              subscriberCount={plainLandingPage.subscriber_count}
              topNoticeText={plainLandingPage.top_notice_text}
              supportLine1={plainLandingPage.support_line_1}
              supportLine2={plainLandingPage.support_line_2}
              ctaButtonText={plainLandingPage.cta_button_text}
              footerNote={plainLandingPage.footer_note}
            />
            <DetailLinkCard landingPageId={landingPageId} />
            <AboutEditingCard />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
