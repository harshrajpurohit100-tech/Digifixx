import {
  Archive,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Link2,
  PauseCircle,
  Percent,
  PlayCircle,
  Send,
  ShieldCheck,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { updateLandingPageStatusAction } from "@/app/admin/landing-pages/actions";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { CopyButton } from "@/components/admin/CopyButton";
import { LandingPageDangerZone } from "@/components/admin/LandingPageDangerZone";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { getAdminDisplayUser, requireAdminUser } from "@/lib/auth/get-admin-user";
import { formatIstDate } from "@/lib/date-format";
import { getPublicLandingPageUrl } from "@/lib/public-url";
import { getLandingPageDetail } from "@/lib/repositories/landing-pages.repository";
import { getLandingPageAnalyticsSummary } from "@/lib/repositories/tracking.repository";
import type {
  LandingPageAnalyticsSummary,
  LandingPageWithClientAndTracking,
} from "@/types/digifixx";

export const dynamic = "force-dynamic";

type LandingPageDetailPageProps = {
  params: Promise<{
    landingPageId: string;
  }>;
};

const emptyAnalytics: LandingPageAnalyticsSummary = {
  totalVisits: 0,
  uniqueVisitors: 0,
  totalConversions: 0,
  conversionRate: 0,
  todayVisits: 0,
  todayConversions: 0,
};

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold leading-5 text-[#0F172A]">
        {value}
      </div>
    </div>
  );
}

function CardHeader({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#F5F3FF] to-[#EFF6FF] text-[#7C3AED]">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <h2 className="text-[17px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function LogoPreview({
  page,
  size = "lg",
}: {
  page: LandingPageWithClientAndTracking;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "size-20" : "size-[72px]";

  if (!page.logo_url) {
    return (
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-xl font-extrabold text-[#7C3AED] ring-1 ring-[#E2E8F0]`}
      >
        {(page.channel_name ?? page.internal_name).charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full border-4 border-white bg-cover bg-center shadow-[0_12px_26px_rgba(15,23,42,0.14)] ring-1 ring-[#E2E8F0]`}
      style={{ backgroundImage: `url(${page.logo_url})` }}
      aria-label={`${page.channel_name ?? page.internal_name} logo`}
    />
  );
}

function ActionButton({
  href,
  icon: Icon,
  children,
  className,
}: {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
  className: string;
}) {
  return (
    <Button asChild className={className}>
      <Link href={href}>
        <Icon data-icon="inline-start" />
        {children}
      </Link>
    </Button>
  );
}

function HeaderActions({ page }: { page: LandingPageWithClientAndTracking }) {
  const publicUrl = getPublicLandingPageUrl(page.public_code);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ActionButton
        href="/admin/landing-pages"
        icon={ArrowLeft}
        className="h-[38px] rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:text-[#0F172A]"
      >
        Back
      </ActionButton>
      <ActionButton
        href={`/admin/landing-pages/${page.id}/edit`}
        icon={Edit3}
        className="h-[38px] rounded-[12px] bg-[#0F172A] px-4 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#334155]"
      >
        Edit
      </ActionButton>

      {(page.status === "draft" || page.status === "paused") && (
        <form
          action={async () => {
            "use server";
            await updateLandingPageStatusAction(page.id, "active");
          }}
        >
          <Button
            type="submit"
            variant="outline"
            className="h-[38px] rounded-[12px] border-[#86EFAC] bg-white px-4 text-sm font-semibold text-[#16A34A] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#ECFDF5] hover:text-[#15803D]"
          >
            <PlayCircle data-icon="inline-start" />
            Activate
          </Button>
        </form>
      )}

      {page.status === "active" && (
        <form
          action={async () => {
            "use server";
            await updateLandingPageStatusAction(page.id, "paused");
          }}
        >
          <Button
            type="submit"
            variant="outline"
            className="h-[38px] rounded-[12px] border-[#FED7AA] bg-white px-4 text-sm font-semibold text-[#EA580C] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#FFF7ED] hover:text-[#C2410C]"
          >
            <PauseCircle data-icon="inline-start" />
            Pause
          </Button>
        </form>
      )}

      {page.status !== "archived" && (
        <form
          action={async () => {
            "use server";
            await updateLandingPageStatusAction(page.id, "archived");
          }}
        >
          <Button
            type="submit"
            variant="outline"
            className="h-[38px] rounded-[12px] border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#64748B] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:text-[#334155]"
          >
            <Archive data-icon="inline-start" />
            Archive
          </Button>
        </form>
      )}

      <CopyButton
        value={publicUrl}
        className="h-[38px] rounded-[12px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#F8FAFC] hover:text-[#0F172A]"
      >
        <Copy data-icon="inline-start" />
        Copy
      </CopyButton>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone: "purple" | "blue" | "green" | "orange";
}) {
  const toneClass = {
    purple: "from-[#EEF2FF] to-[#F5F3FF] text-[#7C3AED]",
    blue: "from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB]",
    green: "from-[#ECFDF5] to-[#DCFCE7] text-[#16A34A]",
    orange: "from-[#FFF7ED] to-[#FFEDD5] text-[#EA580C]",
  }[tone];

  return (
    <section className="min-h-[116px] rounded-[18px] border border-[#E2E8F0] bg-white p-[18px] shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
            {label}
          </p>
          <p className="mt-3 text-[24px] font-extrabold leading-none tracking-[-0.02em] text-[#020617]">
            {value}
          </p>
        </div>
        <span
          className={`flex size-11 items-center justify-center rounded-[14px] bg-gradient-to-br ${toneClass}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-xs font-medium text-[#64748B]">{helper}</p>
    </section>
  );
}

function AnalyticsSummaryRow({
  analytics,
}: {
  analytics: LandingPageAnalyticsSummary;
}) {
  return (
    <div className="grid grid-cols-6 gap-3">
      <MetricCard
        label="Total Visits"
        value={formatNumber(analytics.totalVisits)}
        helper="All time"
        icon={Eye}
        tone="purple"
      />
      <MetricCard
        label="Unique Visitors"
        value={formatNumber(analytics.uniqueVisitors)}
        helper="All time"
        icon={Users}
        tone="blue"
      />
      <MetricCard
        label="Conversions"
        value={formatNumber(analytics.totalConversions)}
        helper="All time"
        icon={TrendingUp}
        tone="green"
      />
      <MetricCard
        label="Conv. Rate"
        value={`${analytics.conversionRate}%`}
        helper="All time"
        icon={Percent}
        tone="orange"
      />
      <MetricCard
        label="Today Visits"
        value={formatNumber(analytics.todayVisits)}
        helper="Today"
        icon={CalendarDays}
        tone="blue"
      />
      <MetricCard
        label="Today Conv."
        value={formatNumber(analytics.todayConversions)}
        helper="Today"
        icon={CheckCircle2}
        tone="green"
      />
    </div>
  );
}

function PublicUrlCard({ page }: { page: LandingPageWithClientAndTracking }) {
  const publicUrl = getPublicLandingPageUrl(page.public_code);

  return (
    <AdminCard
      className="rounded-[20px] shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
      padding="lg"
    >
      <CardHeader title="Public URL" icon={Link2} />
      <div className="mt-5 flex items-center gap-3">
        <code className="min-w-0 flex-1 truncate rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 font-mono text-sm font-semibold text-[#0F172A]">
          {publicUrl}
        </code>
        <CopyButton value={publicUrl} />
      </div>
      <p className="mt-3 text-xs leading-5 text-[#64748B]">
        This URL does not reveal client or channel names.
        {page.status !== "active" ? (
          <span className="mt-1 block font-semibold text-[#DC2626]">
            Public URL only works when status is active.
          </span>
        ) : null}
      </p>
    </AdminCard>
  );
}

function PageStatusCard({ page }: { page: LandingPageWithClientAndTracking }) {
  return (
    <AdminCard
      className="rounded-[20px] shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
      padding="lg"
    >
      <CardHeader title="Page Status" icon={BadgeCheck} />
      <div className="mt-5 grid gap-4">
        <DetailItem label="Status" value={<StatusBadge status={page.status} />} />
        <DetailItem label="Created" value={formatIstDate(page.created_at)} />
        <DetailItem label="Updated" value={formatIstDate(page.updated_at)} />
      </div>
    </AdminCard>
  );
}

function TrackingCard({ page }: { page: LandingPageWithClientAndTracking }) {
  const hasCapi = Boolean(page.tracking_profile?.capi_token_last4);

  return (
    <AdminCard
      className="rounded-[20px] shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
      padding="lg"
    >
      <CardHeader title="Tracking" icon={ShieldCheck} />
      <div className="mt-5 grid gap-4">
        <DetailItem
          label="Pixel ID"
          value={page.tracking_profile?.pixel_id ?? "Not configured"}
        />
        <DetailItem
          label="CAPI Status"
          value={
            <span className="inline-flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  hasCapi
                    ? "bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                    : "bg-[#F59E0B]"
                }`}
              />
              {hasCapi
                ? `Connected (••••${page.tracking_profile?.capi_token_last4})`
                : "Missing"}
            </span>
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
    <AdminCard
      className="rounded-[20px] shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
      padding="lg"
    >
      <CardHeader title="Telegram Page Content" icon={Send} />
      <div className="mt-6 flex items-start gap-6">
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
            label="CTA Button Text"
            value={page.cta_button_text}
          />
          <DetailItem
            label="Support Line 1"
            value={page.support_line_1 ?? "Not configured"}
          />
          <DetailItem
            label="Support Line 2"
            value={page.support_line_2 ?? "Not configured"}
          />
          <DetailItem
            label="Telegram URL"
            value={
              <a
                href={page.primary_button_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#2563EB]"
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

function PublicPreviewCard({
  page,
}: {
  page: LandingPageWithClientAndTracking;
}) {
  return (
    <AdminCard
      className="rounded-[20px] shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
      padding="lg"
    >
      <CardHeader title="Public Page Preview" icon={Eye} />
      <p className="mt-3 text-[13px] leading-5 text-[#64748B]">
        Live structure for the coded public page /p/{page.public_code}.
      </p>
      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex h-8 items-center justify-center bg-[#0EA5E9] px-3 text-center text-[11px] font-bold text-white">
          {page.top_notice_text}
        </div>
        <div className="p-5 text-center">
          <div className="mx-auto flex justify-center">
            <LogoPreview page={page} size="md" />
          </div>
          <h3 className="mt-4 text-xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
            {page.channel_name ?? page.internal_name}
          </h3>
          {page.subscriber_count ? (
            <p className="mt-1 text-[13px] font-medium text-[#64748B]">
              {page.subscriber_count.toLocaleString()} subscribers
            </p>
          ) : null}
          <div className="mt-5 space-y-2 text-left">
            {page.support_line_1 ? (
              <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3 text-xs font-semibold leading-5 text-[#1E293B]">
                {page.support_line_1}
              </div>
            ) : null}
            {page.support_line_2 ? (
              <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3 text-xs font-semibold leading-5 text-[#1E293B]">
                {page.support_line_2}
              </div>
            ) : null}
          </div>
          <div className="mt-5 inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#0284C7] px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(2,132,199,0.20)]">
            <Send className="size-4" aria-hidden="true" />
            {page.cta_button_text}
          </div>
          {page.footer_note ? (
            <p className="mt-4 text-xs leading-5 text-[#64748B]">
              {page.footer_note}
            </p>
          ) : null}
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
  let page: LandingPageWithClientAndTracking | null = null;
  let analytics: LandingPageAnalyticsSummary | null = null;

  try {
    [page, analytics] = await Promise.all([
      getLandingPageDetail(landingPageId),
      getLandingPageAnalyticsSummary(landingPageId).catch(() => null),
    ]);
  } catch (error) {
    console.error("Unable to load landing page detail", error);

    return (
      <AdminShell
        title="Landing Page"
        description="Landing page configuration, public code, and tracking profile overview."
        user={getAdminDisplayUser(adminUser)}
      >
        <AdminCard className="rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="max-w-xl">
            <h2 className="text-lg font-extrabold text-[#0F172A]">
              Unable to load landing page
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              There was a problem loading this landing page. Check Supabase
              configuration, service role access, and database policies.
            </p>
          </div>
        </AdminCard>
      </AdminShell>
    );
  }

  if (!page) {
    notFound();
  }

  const title = page.channel_name ?? page.internal_name;
  const publicPath = `/p/${page.public_code}`;

  return (
    <AdminShell
      title={title}
      description="Landing page configuration, public code, and tracking profile overview."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="relative flex flex-col gap-5">
        <div className="pointer-events-none absolute right-0 top-0 -z-10 size-[360px] rounded-full bg-[#7C3AED]/[0.08] blur-3xl" />

        <div className="flex items-start justify-between gap-5 rounded-[22px] border border-[#E2E8F0] bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-[#020617]">
                {title}
              </h1>
              <StatusBadge status={page.status} />
            </div>
            <p className="mt-2 text-sm leading-5 text-[#64748B]">
              Landing page configuration, public code, and tracking profile
              overview.
            </p>
            <span className="mt-3 inline-flex rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 font-mono text-xs font-bold text-[#475569]">
              {publicPath}
            </span>
          </div>
          <HeaderActions page={page} />
        </div>

        <AnalyticsSummaryRow analytics={analytics ?? emptyAnalytics} />

        <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
          <PublicUrlCard page={page} />
          <PageStatusCard page={page} />
          <TrackingCard page={page} />
        </div>

        <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(360px,0.9fr)] gap-4">
          <TelegramContentCard page={page} />
          <PublicPreviewCard page={page} />
        </div>

        <LandingPageDangerZone landingPageId={page.id} />
      </div>
    </AdminShell>
  );
}
