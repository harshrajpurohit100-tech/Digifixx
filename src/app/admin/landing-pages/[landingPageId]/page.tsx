import { format } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { CopyButton } from "@/components/admin/CopyButton";
import { LandingPageDangerZone } from "@/components/admin/LandingPageDangerZone";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import { getPublicLandingPageUrl } from "@/lib/public-url";
import { getLandingPageDetail } from "@/lib/repositories/landing-pages.repository";
import { updateLandingPageStatusAction } from "@/app/admin/landing-pages/actions";
import type { LandingPageWithClientAndTracking } from "@/types/digifixx";

export const dynamic = "force-dynamic";

type LandingPageDetailPageProps = {
  params: Promise<{
    landingPageId: string;
  }>;
};

function formatDate(value: string) {
  return format(new Date(value), "MMM d, yyyy");
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#94A3B8]">
        {label}
      </p>
      <div className="mt-2 text-sm font-medium text-[#0F172A]">{value}</div>
    </div>
  );
}

function LogoPreview({ page }: { page: LandingPageWithClientAndTracking }) {
  if (!page.logo_url) {
    return (
      <div className="flex size-20 items-center justify-center rounded-full bg-[#E2E8F0] text-xl font-bold text-[#475569]">
        {(page.channel_name ?? page.internal_name).charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="size-20 rounded-full border border-[#E2E8F0] bg-cover bg-center"
      style={{ backgroundImage: `url(${page.logo_url})` }}
      aria-label={`${page.channel_name ?? page.internal_name} logo`}
    />
  );
}

function PublicUrlCard({ page }: { page: LandingPageWithClientAndTracking }) {
  const publicUrl = getPublicLandingPageUrl(page.public_code);

  return (
    <AdminCard>
      <p className="text-[13px] font-medium text-[#64748B]">Public URL</p>
      <div className="mt-3 flex items-center gap-3">
        <code className="rounded-lg bg-[#F8FAFC] px-3 py-2 font-mono text-sm font-semibold text-[#0F172A]">
          {publicUrl}
        </code>
        <CopyButton value={publicUrl} />
      </div>
      <p className="mt-3 text-xs leading-5 text-[#64748B]">
        This URL does not reveal client or channel names.
        {page.status !== "active" && (
          <span className="mt-1 block font-semibold text-[#EF4444]">
            Note: Public URL only works when status is active.
          </span>
        )}
      </p>
    </AdminCard>
  );
}

function TrackingCard({ page }: { page: LandingPageWithClientAndTracking }) {
  return (
    <AdminCard>
      <p className="text-[13px] font-medium text-[#64748B]">Tracking</p>
      <div className="mt-4 grid gap-4">
        <DetailItem
          label="Pixel ID"
          value={page.tracking_profile?.pixel_id ?? "Not configured"}
        />
        <DetailItem
          label="CAPI Status"
          value={
            page.tracking_profile?.capi_token_last4
              ? `Connected (••••${page.tracking_profile.capi_token_last4})`
              : "Missing"
          }
        />
      </div>
    </AdminCard>
  );
}

function TelegramContentCard({
  page,
}: {
  page: LandingPageWithClientAndTracking;
}) {
  return (
    <AdminCard>
      <h2 className="text-lg font-bold leading-tight text-[#0F172A]">
        Telegram Page Content
      </h2>
      <div className="mt-5 flex items-start gap-5">
        <LogoPreview page={page} />
        <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-5">
          <DetailItem
            label="Channel Name"
            value={page.channel_name ?? "Not configured"}
          />
          <DetailItem
            label="Subscriber Count"
            value={page.subscriber_count?.toLocaleString() ?? "Hidden"}
          />
          <DetailItem label="Top Notice" value={page.top_notice_text} />
          <DetailItem
            label="Support Line 1"
            value={page.support_line_1 ?? "Not configured"}
          />
          <DetailItem
            label="Support Line 2"
            value={page.support_line_2 ?? "Not configured"}
          />
          <DetailItem label="CTA Button Text" value={page.cta_button_text} />
          <DetailItem
            label="Telegram URL"
            value={
              <a
                href={page.primary_button_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#2563EB]"
              >
                Open link
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            }
          />
          <DetailItem
            label="Footer Note"
            value={page.footer_note ?? "Not configured"}
          />
        </div>
      </div>
    </AdminCard>
  );
}

function PreviewPlaceholder({
  page,
}: {
  page: LandingPageWithClientAndTracking;
}) {
  return (
    <AdminCard>
      <h2 className="text-lg font-bold leading-tight text-[#0F172A]">
        Public Renderer Coming in Phase 6
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#64748B]">
        The coded public page /p/{page.public_code} will be connected in the
        next phase.
      </p>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="bg-[#0EA5E9] px-4 py-2 text-center text-xs font-semibold text-white">
          {page.top_notice_text}
        </div>
        <div className="p-6 text-center">
          <div className="mx-auto">
            <LogoPreview page={page} />
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#0F172A]">
            {page.channel_name ?? page.internal_name}
          </h3>
          {page.subscriber_count ? (
            <p className="mt-1 text-sm text-[#64748B]">
              {page.subscriber_count.toLocaleString()} subscribers
            </p>
          ) : null}
          <div className="mt-5 rounded-xl bg-[#0284C7] px-4 py-3 text-sm font-bold text-white">
            {page.cta_button_text}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

export default async function LandingPageDetailPage({
  params,
}: LandingPageDetailPageProps) {
  const adminUser = await requireAdminUser();
  const { landingPageId } = await params;
  const page = await getLandingPageDetail(landingPageId);

  if (!page) {
    notFound();
  }

  return (
    <AdminShell
      title={page.channel_name ?? page.internal_name}
      description="Landing page configuration, public code, and tracking profile overview."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title={page.channel_name ?? page.internal_name}
          description="Landing page configuration, public code, and tracking profile overview."
          action={
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-[38px] rounded-[10px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569]"
              >
                <Link href="/admin/landing-pages">
                  <ArrowLeft data-icon="inline-start" className="mr-2 size-4" />
                  Back
                </Link>
              </Button>

              <div className="h-5 w-px bg-[#E2E8F0]" />

              <Button
                asChild
                className="h-[38px] rounded-[10px] bg-[#0F172A] px-4 text-sm font-semibold text-white hover:bg-[#334155]"
              >
                <Link href={`/admin/landing-pages/${page.id}/edit`}>Edit</Link>
              </Button>

              {(page.status === "draft" || page.status === "paused") && (
                <form action={async () => {
                  "use server";
                  await updateLandingPageStatusAction(page.id, "active");
                }}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-[38px] rounded-[10px] border-[#10B981] bg-white px-4 text-sm font-semibold text-[#10B981] hover:bg-[#D1FAE5] hover:text-[#059669]"
                  >
                    Activate
                  </Button>
                </form>
              )}

              {page.status === "active" && (
                <form action={async () => {
                  "use server";
                  await updateLandingPageStatusAction(page.id, "paused");
                }}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-[38px] rounded-[10px] border-[#F59E0B] bg-white px-4 text-sm font-semibold text-[#F59E0B] hover:bg-[#FEF3C7] hover:text-[#D97706]"
                  >
                    Pause
                  </Button>
                </form>
              )}

              {page.status !== "archived" && (
                <form action={async () => {
                  "use server";
                  await updateLandingPageStatusAction(page.id, "archived");
                }}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-[38px] rounded-[10px] border-[#64748B] bg-white px-4 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#475569]"
                  >
                    Archive
                  </Button>
                </form>
              )}

              <div className="h-5 w-px bg-[#E2E8F0]" />

              <CopyButton value={getPublicLandingPageUrl(page.public_code)} />
            </div>
          }
        />

        <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
          <PublicUrlCard page={page} />
          <AdminCard>
            <p className="text-[13px] font-medium text-[#64748B]">
              Page Status
            </p>
            <div className="mt-4 grid gap-4">
              <DetailItem label="Status" value={<StatusBadge status={page.status} />} />
              <DetailItem label="Created" value={formatDate(page.created_at)} />
              <DetailItem label="Updated" value={formatDate(page.updated_at)} />
            </div>
          </AdminCard>
          <TrackingCard page={page} />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <TelegramContentCard page={page} />
          <PreviewPlaceholder page={page} />
        </div>

        <LandingPageDangerZone landingPageId={page.id} />
      </div>
    </AdminShell>
  );
}
