"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { format } from "date-fns";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";

/* Plain serializable shape passed from server */
export type PlainClient = {
  id: string;
  name: string;
  internal_code: string | null;
  contact_name: string | null;
  contact_email: string | null;
  status: "active" | "paused" | "archived";
  updated_at: string;
};

type ClientsDirectoryProps = {
  clients: PlainClient[];
};

function formatDate(iso: string) {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function ClientAvatar({ name }: { name: string }) {
  const initial = (name.charAt(0) || "?").toUpperCase();
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#F5F3FF] text-[15px] font-extrabold text-[#7C3AED]">
      {initial}
    </div>
  );
}

export function ClientsDirectory({ clients }: ClientsDirectoryProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? clients.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.internal_code?.toLowerCase().includes(q) ?? false) ||
          (c.contact_name?.toLowerCase().includes(q) ?? false) ||
          (c.contact_email?.toLowerCase().includes(q) ?? false)
        );
      })
    : clients;

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      {/* Directory header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E2E8F0] px-6 py-5">
        <div>
          <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
            Client Directory
          </h2>
          <p className="mt-0.5 text-[12px] text-[#64748B]">
            All client workspaces and access to their accounts.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            className="h-11 w-[300px] rounded-[12px] border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] transition-colors focus:border-[#BFDBFE] focus:ring-2 focus:ring-[#BFDBFE]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-[14px] bg-[#F1F5F9]">
            <Search className="size-5 text-[#94A3B8]" />
          </div>
          <p className="mt-3 text-[14px] font-semibold text-[#0F172A]">
            {query ? "No clients match your search" : "No clients yet"}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            {query
              ? "Try a different name, email, or code."
              : "Add your first client to create and manage coded landing pages."}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {[
                    "Client",
                    "Contact",
                    "Status",
                    "Active Pages",
                    "Tracking Profiles",
                    "Last Updated",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="group transition-colors hover:bg-[#F8FAFC]"
                    style={{ height: "80px" }}
                  >
                    {/* Client */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <ClientAvatar name={client.name} />
                        <div>
                          <p className="text-[14px] font-bold text-[#0F172A]">
                            {client.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-[#94A3B8]">
                            {client.internal_code
                              ? `ID: ${client.internal_code}`
                              : "Client record"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      {client.contact_name || client.contact_email ? (
                        <div>
                          <p className="text-[13px] font-semibold text-[#0F172A]">
                            {client.contact_name ?? "—"}
                          </p>
                          {client.contact_email && (
                            <p className="mt-0.5 text-[11px] text-[#64748B]">
                              {client.contact_email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[13px] text-[#94A3B8]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={client.status} />
                    </td>

                    {/* Active Pages — placeholder */}
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-medium text-[#475569]">0</span>
                    </td>

                    {/* Tracking Profiles — placeholder */}
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-medium text-[#475569]">0</span>
                    </td>

                    {/* Last Updated */}
                    <td className="px-5 py-4">
                      <p className="text-[13px] text-[#475569]">
                        {formatDate(client.updated_at)}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <Button
                        asChild
                        variant="outline"
                        className="h-9 rounded-[10px] border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      >
                        <Link href={`/admin/clients/${client.id}`}>
                          <Eye className="mr-1.5 size-3.5" />
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4">
            <p className="text-[12px] text-[#94A3B8]">
              Showing{" "}
              <span className="font-semibold text-[#475569]">{filtered.length}</span>{" "}
              {filtered.length === clients.length
                ? `of ${clients.length} client${clients.length !== 1 ? "s" : ""}`
                : `results of ${clients.length} client${clients.length !== 1 ? "s" : ""}`}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="flex h-8 min-w-[72px] items-center justify-center rounded-[8px] border border-[#E2E8F0] bg-white px-3 text-[12px] font-semibold text-[#94A3B8] disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="flex size-8 items-center justify-center rounded-[8px] border border-[#7C3AED] bg-[#F5F3FF] text-[12px] font-bold text-[#7C3AED]">
                1
              </button>
              <button
                disabled
                className="flex h-8 min-w-[56px] items-center justify-center rounded-[8px] border border-[#E2E8F0] bg-white px-3 text-[12px] font-semibold text-[#94A3B8] disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
