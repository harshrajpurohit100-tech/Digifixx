import {
  Archive,
  CheckCircle,
  PauseCircle,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/admin/EmptyState";
import { ClientsDirectory } from "@/components/admin/ClientsDirectory";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import { listClients } from "@/lib/repositories/clients.repository";
import type { Client, ClientStatus } from "@/types/digifixx";

export const dynamic = "force-dynamic";

/* ── helpers ── */
function countByStatus(clients: Client[], status: ClientStatus) {
  return clients.filter((c) => c.status === status).length;
}

/* ── premium stat card ── */
function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)]" style={{ minHeight: "140px" }}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          {label}
        </p>
        <div className={`flex size-[52px] shrink-0 items-center justify-center rounded-[14px] ${iconBg}`}>
          <Icon className={`size-[22px] ${iconColor}`} aria-hidden="true" />
        </div>
      </div>
      <div>
        <p className="text-[30px] font-extrabold leading-none tracking-[-0.03em] text-[#0F172A]">
          {value}
        </p>
        <p className="mt-1.5 text-[12px] text-[#94A3B8]">{helper}</p>
      </div>
    </div>
  );
}

/* ── error card ── */
function ErrorCard() {
  return (
    <div className="rounded-[22px] border border-[#FECACA] bg-[#FEF2F2] p-6 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <h3 className="text-[15px] font-extrabold text-[#B91C1C]">
        Unable to load clients
      </h3>
      <p className="mt-1.5 text-[13px] leading-5 text-[#B91C1C]/80">
        There was a problem loading client data. Check Supabase configuration
        and RLS policies.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */

export default async function ClientsPage() {
  const adminUser = await requireAdminUser();
  let clients: Client[] = [];
  let hasLoadError = false;

  try {
    clients = await listClients();
  } catch (err) {
    console.error("Unable to load clients", err);
    hasLoadError = true;
  }

  /* serializable plain objects for client components */
  const plainClients = clients.map((c) => ({
    id: c.id,
    name: c.name,
    internal_code: c.internal_code,
    contact_name: c.contact_name,
    contact_email: c.contact_email,
    status: c.status,
    updated_at: c.updated_at,
  }));

  return (
    <AdminShell
      title="Clients"
      description="Manage client workspaces, contacts, and campaign information."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="relative flex flex-col gap-5">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute right-0 top-0 -z-10 size-[360px] rounded-full bg-[#7C3AED]/[0.07] blur-3xl" />

        {/* ── Header card ── */}
        <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[#E2E8F0] bg-white px-6 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[16px] bg-[#F5F3FF]">
              <Users className="size-7 text-[#7C3AED]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-[18px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
                Clients
              </h1>
              <p className="mt-0.5 text-[13px] text-[#64748B]">
                Manage client workspaces, contacts, and campaign information.
              </p>
            </div>
          </div>

          <Button
            asChild
            className="h-[42px] rounded-[12px] bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_16px_32px_rgba(37,99,235,0.30)]"
          >
            <Link href="/admin/clients/new">
              <Plus className="mr-2 size-4" />
              Add Client
            </Link>
          </Button>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Clients"
            value={clients.length}
            helper="All time"
            icon={Users}
            iconBg="bg-[#F5F3FF]"
            iconColor="text-[#7C3AED]"
          />
          <StatCard
            label="Active Clients"
            value={countByStatus(clients, "active")}
            helper="Active now"
            icon={CheckCircle}
            iconBg="bg-[#ECFDF5]"
            iconColor="text-[#16A34A]"
          />
          <StatCard
            label="Paused Clients"
            value={countByStatus(clients, "paused")}
            helper="Currently paused"
            icon={PauseCircle}
            iconBg="bg-[#FFF7ED]"
            iconColor="text-[#EA580C]"
          />
          <StatCard
            label="Archived Clients"
            value={countByStatus(clients, "archived")}
            helper="Archived"
            icon={Archive}
            iconBg="bg-[#F1F5F9]"
            iconColor="text-[#64748B]"
          />
        </div>

        {/* ── Error or Directory ── */}
        {hasLoadError ? (
          <ErrorCard />
        ) : clients.length === 0 ? (
          <div className="overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add your first client to create and manage coded landing pages."
              action={
                <Button
                  asChild
                  className="h-[42px] rounded-[12px] bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] hover:-translate-y-[1px] transition-all duration-200"
                >
                  <Link href="/admin/clients/new">
                    <Plus className="mr-2 size-4" />
                    Add Client
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ClientsDirectory clients={plainClients} />
        )}
      </div>
    </AdminShell>
  );
}
