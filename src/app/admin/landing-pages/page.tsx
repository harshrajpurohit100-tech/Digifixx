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

const landingPages = [
  {
    code: "A8xK92LmQ",
    client: "Nova Media",
    status: "Active",
    visits: "12,842",
    conversions: "2,104",
    pixelStatus: "Connected",
    lastUpdated: "Today",
  },
  {
    code: "P7mQ2xLpB",
    client: "Apex Growth",
    status: "Active",
    visits: "8,390",
    conversions: "1,288",
    pixelStatus: "Connected",
    lastUpdated: "Yesterday",
  },
  {
    code: "V8zR42AkL",
    client: "Northline Ads",
    status: "Paused",
    visits: "3,219",
    conversions: "402",
    pixelStatus: "Missing CAPI",
    lastUpdated: "3 days ago",
  },
  {
    code: "Q5nT81BxC",
    client: "Urban Scale",
    status: "Draft",
    visits: "0",
    conversions: "0",
    pixelStatus: "Not configured",
    lastUpdated: "1 week ago",
  },
];

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Active"
      ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#16A34A]"
      : status === "Paused"
        ? "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]"
        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]";

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

function PixelStatusBadge({ status }: { status: string }) {
  const className =
    status === "Connected"
      ? "border-[#BBF7D0] bg-[#ECFDF5] text-[#16A34A]"
      : status === "Missing CAPI"
        ? "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]"
        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]";

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

export default async function LandingPagesPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      title="Landing Pages"
      description="Create, publish, and monitor public coded landing pages."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="Landing Pages"
          description="Public code routes will be connected in a later phase."
          action={
            <Button
              disabled
              className="h-9 rounded-[10px] bg-[#2563EB] px-3 text-sm font-semibold text-white"
            >
              <Plus data-icon="inline-start" />
              Create Landing Page
            </Button>
          }
        />

        <AdminCard padding="none">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                {[
                  "Public Code",
                  "Client",
                  "Status",
                  "Visits",
                  "Conversions",
                  "Pixel Status",
                  "Last Updated",
                ].map((heading) => (
                  <TableHead
                    key={heading}
                    className="h-12 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]"
                  >
                    {heading}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {landingPages.map((page) => (
                <TableRow
                  key={page.code}
                  className="border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  <TableCell className="px-5 py-4 font-mono text-sm font-semibold text-[#0F172A]">
                    {page.code}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-[#475569]">
                    {page.client}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <StatusBadge status={page.status} />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-[#475569]">
                    {page.visits}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-[#475569]">
                    {page.conversions}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <PixelStatusBadge status={page.pixelStatus} />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-[#64748B]">
                    {page.lastUpdated}
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
