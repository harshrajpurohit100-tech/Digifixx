import { ArrowLeft, Eye, Send } from "lucide-react";
import Link from "next/link";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { LandingPageForm } from "@/components/admin/LandingPageForm";
import { Button } from "@/components/ui/button";
import {
  getAdminDisplayUser,
  requireAdminUser,
} from "@/lib/auth/get-admin-user";
import {
  DEFAULT_CTA_BUTTON_TEXT,
  DEFAULT_FOOTER_NOTE,
  DEFAULT_SUPPORT_LINE_1,
  DEFAULT_SUPPORT_LINE_2,
  DEFAULT_TOP_NOTICE_TEXT,
} from "@/lib/landing-page-defaults";
import { listClients } from "@/lib/repositories/clients.repository";

export const dynamic = "force-dynamic";

function PreviewStructureCard() {
  return (
    <AdminCard
      className="sticky top-24 self-start rounded-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      padding="lg"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-extrabold tracking-[-0.01em] text-[#0F172A]">
          Public Page Preview Structure
        </h2>
        <span className="flex size-9 items-center justify-center rounded-[12px] bg-[#EFF6FF] text-[#2563EB]">
          <Eye className="size-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex h-8 items-center justify-center bg-[#0EA5E9] px-3 text-center text-[11px] font-bold text-white">
          {DEFAULT_TOP_NOTICE_TEXT.replace("'", "’")}
        </div>
        <div className="p-5 text-center">
          <div className="mx-auto flex size-[76px] items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] text-2xl font-extrabold text-[#2563EB] shadow-[0_12px_26px_rgba(15,23,42,0.14)]">
            D
          </div>
          <h3 className="mt-4 text-xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
            Channel Name
          </h3>
          <p className="mt-1 text-[13px] font-medium text-[#64748B]">
            Subscriber count appears here
          </p>

          <div className="mt-5 space-y-2.5 text-left">
            <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3 text-[13px] font-semibold leading-5 text-[#1E293B]">
              {DEFAULT_SUPPORT_LINE_1}
            </div>
            <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3 text-[13px] font-semibold leading-5 text-[#1E293B]">
              {DEFAULT_SUPPORT_LINE_2}
            </div>
          </div>

          <div className="mt-5 inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#0284C7] px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(2,132,199,0.20)]">
            <Send className="size-4" aria-hidden="true" />
            {DEFAULT_CTA_BUTTON_TEXT}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#64748B]">
            {DEFAULT_FOOTER_NOTE}
          </p>
          <p className="mt-3 border-t border-[#E2E8F0] pt-3 text-[11px] leading-5 text-[#94A3B8]">
            Footer note and compliance copy appears here.
          </p>
        </div>
      </div>
    </AdminCard>
  );
}

export default async function NewLandingPagePage() {
  const adminUser = await requireAdminUser();
  let clientOptions: {
    id: string;
    name: string;
    status: "active" | "paused" | "archived";
  }[] = [];
  let clientsError = false;

  try {
    const fetchedClients = await listClients();
    clientOptions = fetchedClients.map((client) => ({
      id: client.id,
      name: client.name,
      status: client.status,
    }));
  } catch (error) {
    console.error("Unable to load clients for landing page form", error);
    clientsError = true;
  }

  return (
    <AdminShell
      title="Create Landing Page"
      description="Build a short coded Telegram landing page with dedicated Pixel and CAPI tracking."
      user={getAdminDisplayUser(adminUser)}
    >
      <div className="relative flex flex-col gap-5">
        <div className="pointer-events-none absolute right-0 top-0 -z-10 size-[360px] rounded-full bg-[#7C3AED]/[0.08] blur-3xl" />

        <div className="flex items-center justify-end">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-[12px] border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <Link href="/admin/landing-pages">
              <ArrowLeft data-icon="inline-start" />
              Back to Landing Pages
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(360px,0.88fr)] gap-6">
          <AdminCard
            className="rounded-[22px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            padding="lg"
          >
            {clientsError ? (
              <div>
                <h3 className="font-bold text-[#0F172A]">
                  Unable to load clients
                </h3>
                <p className="mt-1 text-sm text-[#475569]">
                  There was a problem loading client data. Check Supabase
                  configuration and RLS policies.
                </p>
              </div>
            ) : (
              <LandingPageForm clients={clientOptions} />
            )}
          </AdminCard>
          <PreviewStructureCard />
        </div>
      </div>
    </AdminShell>
  );
}
