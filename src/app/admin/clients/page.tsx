import { Plus, Users } from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import { listClients } from "@/lib/repositories/clients.repository";
import type { Client, ClientStatus } from "@/types/digifixx";

export const dynamic = "force-dynamic";

type SummaryCardProps = {
  label: string;
  value: number;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <AdminCard className="min-h-[96px]" padding="md">
      <p className="text-[13px] font-medium text-[#64748B]">{label}</p>
      <p className="mt-3 text-[26px] font-bold leading-none tracking-tight text-[#0F172A]">
        {value}
      </p>
    </AdminCard>
  );
}

function getClientCountByStatus(clients: Client[], status: ClientStatus) {
  return clients.filter((client) => client.status === status).length;
}

function ClientLoadError() {
  return (
    <AdminCard>
      <div className="max-w-xl">
        <h2 className="text-lg font-bold text-[#0F172A]">
          Unable to load clients
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          There was a problem loading client data. Check Supabase configuration
          and RLS policies.
        </p>
      </div>
    </AdminCard>
  );
}

export default async function ClientsPage() {
  const adminUser = await requireAdminUser();
  let clients: Client[] = [];
  let hasLoadError = false;

  try {
    clients = await listClients();
  } catch (error) {
    console.error("Unable to load clients", error);
    hasLoadError = true;
  }

  return (
    <AdminShell
      title="Clients"
      description="Manage client workspaces, ownership, and campaign infrastructure."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Clients"
          description="Manage client workspaces, ownership, and campaign infrastructure."
          action={
            <Button
              asChild
              className="h-[38px] rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              <Link href="/admin/clients/new">
                <Plus data-icon="inline-start" />
                Add Client
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-4 gap-4">
          <SummaryCard label="Total Clients" value={clients.length} />
          <SummaryCard
            label="Active"
            value={getClientCountByStatus(clients, "active")}
          />
          <SummaryCard
            label="Paused"
            value={getClientCountByStatus(clients, "paused")}
          />
          <SummaryCard
            label="Archived"
            value={getClientCountByStatus(clients, "archived")}
          />
        </div>

        {hasLoadError ? (
          <ClientLoadError />
        ) : (
          <AdminCard padding="none">
            <div className="border-b border-[#E2E8F0] p-5">
              <h2 className="text-lg font-bold leading-tight text-[#0F172A]">
                Client Directory
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
                All client workspaces available to Digifixx operators.
              </p>
            </div>
            {clients.length > 0 ? (
              <ClientsTable clients={clients} />
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={Users}
                  title="No clients yet"
                  description="Create your first client workspace before adding landing pages and tracking profiles."
                  action={
                    <Button
                      asChild
                      className="h-[38px] rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                    >
                      <Link href="/admin/clients/new">
                        <Plus data-icon="inline-start" />
                        Add Client
                      </Link>
                    </Button>
                  }
                />
              </div>
            )}
          </AdminCard>
        )}
      </div>
    </AdminShell>
  );
}
