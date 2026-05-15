import { format } from "date-fns";
import Link from "next/link";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/types/digifixx";

type ClientsTableProps = {
  clients: Client[];
};

function formatDate(value: string) {
  return format(new Date(value), "MMM d, yyyy");
}

export function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#E2E8F0] hover:bg-transparent">
          {[
            "Client",
            "Contact",
            "Status",
            "Active Pages",
            "Tracking Profiles",
            "Last Updated",
            "Actions",
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
        {clients.map((client) => (
          <TableRow
            key={client.id}
            className="border-[#E2E8F0] hover:bg-[#F8FAFC]"
          >
            <TableCell className="px-5 py-4">
              <p className="text-sm font-semibold text-[#0F172A]">
                {client.name}
              </p>
              <p className="mt-1 font-mono text-xs text-[#94A3B8]">
                {client.internal_code ?? "No internal code"}
              </p>
            </TableCell>
            <TableCell className="px-5 py-4">
              {client.contact_name || client.contact_email ? (
                <div>
                  <p className="text-sm font-medium text-[#475569]">
                    {client.contact_name ?? "No contact name"}
                  </p>
                  {client.contact_email ? (
                    <p className="mt-1 text-xs text-[#64748B]">
                      {client.contact_email}
                    </p>
                  ) : null}
                </div>
              ) : (
                <span className="text-sm text-[#94A3B8]">
                  No contact added
                </span>
              )}
            </TableCell>
            <TableCell className="px-5 py-4">
              <StatusBadge status={client.status} />
            </TableCell>
            <TableCell className="px-5 py-4 text-sm text-[#64748B]">
              0
            </TableCell>
            <TableCell className="px-5 py-4 text-sm text-[#64748B]">
              0
            </TableCell>
            <TableCell className="px-5 py-4 text-sm text-[#64748B]">
              {formatDate(client.updated_at)}
            </TableCell>
            <TableCell className="px-5 py-4">
              <Button
                asChild
                variant="outline"
                className="h-8 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569]"
              >
                <Link href={`/admin/clients/${client.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
