import { format } from "date-fns";
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
import { getClientById } from "@/lib/repositories/clients.repository";
import type { Client } from "@/types/digifixx";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

function formatDate(value: string) {
  return format(new Date(value), "MMM d, yyyy");
}

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

function PlaceholderCard({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <AdminCard className="min-h-40">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#475569]">
        <Icon className="size-[18px]" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-bold leading-tight text-[#0F172A]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#64748B]">{text}</p>
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
        <DetailItem label="Created At" value={formatDate(client.created_at)} />
      </div>
    </AdminCard>
  );
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const adminUser = await requireAdminUser();
  const { clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) {
    notFound();
  }

  return (
    <AdminShell
      title={client.name}
      description="Client workspace overview and future landing page infrastructure."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title={client.name}
          description="Client workspace overview and future landing page infrastructure."
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
          <PlaceholderCard
            icon={FileText}
            title="Landing Pages"
            text="Landing page management will be connected in the next phase."
          />
          <PlaceholderCard
            icon={RadioTower}
            title="Tracking Profiles"
            text="Meta Pixel and CAPI profiles will be configured in a later phase."
          />
          <PlaceholderCard
            icon={BarChart3}
            title="Analytics"
            text="Client-level analytics will appear after tracking is implemented."
          />
        </div>
      </div>
    </AdminShell>
  );
}
