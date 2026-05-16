import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardOverview } from "@/lib/repositories/dashboard.repository";

type TopLandingPagesCardProps = {
  pages: DashboardOverview["topLandingPages"];
};

export function TopLandingPagesCard({ pages }: TopLandingPagesCardProps) {
  return (
    <AdminCard>
      <SectionHeader
        title="Top Landing Pages"
        action={
          <Button
            asChild
            variant="outline"
            className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
          >
            <Link href="/admin/landing-pages">View all landing pages</Link>
          </Button>
        }
      />
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E2E8F0]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E2E8F0] hover:bg-transparent">
              <TableHead className="px-4 text-xs font-bold uppercase tracking-[0.04em] text-[#64748B]">
                Landing Page
              </TableHead>
              <TableHead className="px-4 text-xs font-bold uppercase tracking-[0.04em] text-[#64748B]">
                Client
              </TableHead>
              <TableHead className="px-4 text-xs font-bold uppercase tracking-[0.04em] text-[#64748B]">
                Visits
              </TableHead>
              <TableHead className="px-4 text-xs font-bold uppercase tracking-[0.04em] text-[#64748B]">
                Conversions
              </TableHead>
              <TableHead className="px-4 text-xs font-bold uppercase tracking-[0.04em] text-[#64748B]">
                Rate
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length > 0 ? (
              pages.map((page) => (
                <TableRow
                  key={page.id}
                  className="border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  <TableCell className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0F172A]">
                        {page.channel_name ?? page.internal_name}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[#64748B]">
                        /p/{page.public_code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-[#475569]">
                    {page.client_name ?? "No client"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                    {page.visits.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-[#0F172A]">
                    {page.conversions.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-[#475569]">
                    {page.conversionRate}%
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-[#64748B]"
                >
                  No landing page traffic yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminCard>
  );
}
