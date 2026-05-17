import {
  ArrowLeft,
  BarChart3,
  FileText,
  RadioTower,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import { formatIstDate } from "@/lib/date-format";
import {
  getClientById,
  getClientWorkspaceSummary,
} from "@/lib/repositories/clients.repository";
import type { Client } from "@/types/digifixx";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#94A3B8]">
        {label}
      </p>
      <div className="mt-2 text-sm font-medium text-[#0F172A]">{value}</div>
    </div>
  );
}

function WorkspaceMetricCard({
  icon: Icon,
  title,
  value,
  helper,
  href,
}: {
  icon: LucideIcon;
  title: string;
  value: number;
  helper: string;
  href: string;
}) {
  return (
    <AdminCard className="min-h-40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#7C3AED]">
          <Icon className="size-[18px]" aria-hidden="true" />
        </div>
        <Button
          asChild
          variant="outline"
          className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
        >
          <Link href={href}>Open</Link>
        </Button>
      </div>
      <h2 className="mt-4 text-lg font-bold leading-tight text-[#0F172A]">
        {title}
      </h2>
      <p className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-[#0F172A]">
        {value.toLocaleString("en-IN")}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#64748B]">{helper}</p>
    </AdminCard>
  );
}

function ClientDetailsCard({ client }: { client: Client }) {
  return (
    <AdminCard>
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        <DetailItem label="Status" value={<StatusBadge status={client.status} />} />
        <DetailItem
          label="Contact Name"
          value={client.contact_name ?? "No contact name"}
        />
        <DetailItem
          label="Contact Email"
          value={client.contact_email ?? "No contact email"}
        />
        <DetailItem
          label="Contact Phone"
          value={client.contact_phone ?? "No contact phone"}
        />
        <DetailItem
          label="Internal Code"
          value={
            <span className="font-mono text-[#475569]">
              {client.internal_code ?? "No internal code"}
            </span>
          }
        />
        <DetailItem label="Created At" value={formatIstDate(client.created_at)} />
      </div>
    </AdminCard>
  );
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const adminUser = await requireAdminUser();
  const { clientId } = await params;
  let client: Client | null = null;

  try {
    client = await getClientById(clientId);
  } catch (error) {
    console.error("Unable to load client detail", error);

    return (
      <AdminShell
        title="Client"
        description="Client workspace overview, landing pages, and tracking activity."
        user={getAdminDisplayUser(adminUser)}
      >
        <AdminCard>
          <div className="max-w-xl">
            <h2 className="text-lg font-extrabold text-[#0F172A]">
              Unable to load client
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              There was a problem loading this client. Check Supabase
              configuration and database policies.
            </p>
          </div>
        </AdminCard>
      </AdminShell>
    );
  }

  if (!client) {
    notFound();
  }

  const summary = await getClientWorkspaceSummary(client.id).catch((error) => {
    console.error("Unable to load client workspace summary", error);
    return {
      totalPages: 0,
      activePages: 0,
      trackingProfiles: 0,
      totalEvents: 0,
    };
  });

  return (
    <AdminShell
      title={client.name}
      description="Client workspace overview, landing pages, and tracking activity."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title={client.name}
          description="Client workspace overview, landing pages, and tracking activity."
          action={
            <Button
              asChild
              variant="outline"
              className="h-[38px] rounded-[10px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569]"
            >
              <Link href="/admin/clients">
                <ArrowLeft data-icon="inline-start" />
                Back to Clients
              </Link>
            </Button>
          }
        />

        <ClientDetailsCard client={client} />

        <div className="grid grid-cols-3 gap-4">
          <WorkspaceMetricCard
            icon={FileText}
            title="Landing Pages"
            value={summary.totalPages}
            helper={`${summary.activePages.toLocaleString("en-IN")} active public pages for this client.`}
            href="/admin/landing-pages"
          />
          <WorkspaceMetricCard
            icon={RadioTower}
            title="Tracking Profiles"
            value={summary.trackingProfiles}
            helper="Active Meta Pixel and CAPI profiles linked to this client."
            href="/admin/landing-pages"
          />
          <WorkspaceMetricCard
            icon={BarChart3}
            title="Analytics"
            value={summary.totalEvents}
            helper="Recorded visits and conversion events attributed to this client."
            href="/admin/analytics"
          />
        </div>
      </div>
    </AdminShell>
  );
}
