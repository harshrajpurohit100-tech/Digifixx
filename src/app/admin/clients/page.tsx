import { Plus } from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const clients = [
  {
    name: "Nova Media",
    activePages: "14",
    trackingProfiles: "3",
    status: "Active",
    lastUpdated: "Today",
  },
  {
    name: "Apex Growth",
    activePages: "9",
    trackingProfiles: "2",
    status: "Active",
    lastUpdated: "Yesterday",
  },
  {
    name: "Northline Ads",
    activePages: "6",
    trackingProfiles: "1",
    status: "Paused",
    lastUpdated: "3 days ago",
  },
  {
    name: "Urban Scale",
    activePages: "19",
    trackingProfiles: "4",
    status: "Active",
    lastUpdated: "1 week ago",
  },
];

function ClientStatusBadge({ status }: { status: string }) {
  const className =
    status === "Active"
      ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#16A34A]"
      : "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]";

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

export default async function ClientsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      title="Clients"
      description="Manage client workspaces, tracking profiles, and landing page ownership."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Clients"
          description="Client records shown here are placeholders for the Phase 1 shell."
          action={
            <Button
              disabled
              className="h-9 rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white"
            >
              <Plus data-icon="inline-start" />
              Add Client
            </Button>
          }
        />

        <AdminCard padding="none">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Client
                </TableHead>
                <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Active Pages
                </TableHead>
                <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Tracking Profiles
                </TableHead>
                <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Status
                </TableHead>
                <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Last Updated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client.name}
                  className="border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  <TableCell className="px-5 py-4 text-sm font-semibold text-[#0F172A]">
                    {client.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-[#475569]">
                    {client.activePages}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-[#475569]">
                    {client.trackingProfiles}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-[#64748B]">
                    {client.lastUpdated}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
